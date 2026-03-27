const https = require('node:https');
const { URL } = require('node:url');

class InterswitchService {
  constructor() {
    this.baseURL = null;
    this.oauthBaseURL = null;
    this.clientId = null;
    this.clientSecret = null;
    this.oauthScope = null;
    this.bvnEndpoint = null;
    this.sendOtpEndpoint = null;
    this.verifyOtpEndpoint = null;
    this.paymentEndpoint = null;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.tokenPromise = null;
    this.refreshConfig();
  }

  getEnvValue(...keys) {
    for (const key of keys) {
      const value = process.env[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    return null;
  }

  refreshConfig() {
    this.baseURL = this.getEnvValue('ISW_BASE_URL');
    this.oauthBaseURL = this.getEnvValue('ISW_OAUTH_BASE_URL') || this.baseURL;
    this.clientId = this.getEnvValue('ISW_CLIENT_ID', 'Client ID');
    this.clientSecret = this.getEnvValue('ISW_CLIENT_SECRET', 'Client Secret');
    this.oauthScope = this.getEnvValue('ISW_OAUTH_SCOPE') || 'profile';
    this.bvnEndpoint = this.getEnvValue('ISW_BVN_ENDPOINT') || '/api/v1/identity/bvn';
    this.sendOtpEndpoint = this.getEnvValue('ISW_SEND_OTP_ENDPOINT') || '/api/v1/safetoken/send';
    this.verifyOtpEndpoint = this.getEnvValue('ISW_VERIFY_OTP_ENDPOINT') || '/api/v1/safetoken/verify';
    this.paymentEndpoint = this.getEnvValue('ISW_PAYMENT_ENDPOINT') || '/api/v1/payments/initiate';
  }

  getBasicAuth() {
    const credentials = `${this.clientId}:${this.clientSecret}`;
    return Buffer.from(credentials).toString('base64');
  }

  isConfigured() {
    this.refreshConfig();
    return Boolean(this.oauthBaseURL && this.clientId && this.clientSecret);
  }

  logResponse(label, payload) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Interswitch] ${label}`, payload);
    }
  }

  createError(message, status, details) {
    const error = new Error(message);
    error.status = status;
    error.details = details;
    return error;
  }

  normalizeEndpoint(endpoint) {
    if (!endpoint) {
      return '/';
    }

    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  async request({ method, endpoint, headers = {}, body, useBasicAuth = false, baseURL = this.baseURL }) {
    const url = new URL(endpoint, baseURL);

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port || 443,
          path: `${url.pathname}${url.search}`,
          method,
          family: 4,
          headers: {
            Accept: 'application/json',
            ...headers,
            ...(useBasicAuth ? { Authorization: `Basic ${this.getBasicAuth()}` } : {})
          }
        },
        (res) => {
          let rawData = '';

          res.on('data', (chunk) => {
            rawData += chunk;
          });

          res.on('end', () => {
            let responseData = {};

            try {
              responseData = rawData ? JSON.parse(rawData) : {};
            } catch (error) {
              responseData = { raw: rawData };
            }

            this.logResponse(`${method} ${url.pathname}`, responseData);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(responseData);
              return;
            }

            reject(
              this.createError(
                responseData.error_description || responseData.description || responseData.message || 'Interswitch request failed',
                res.statusCode,
                responseData
              )
            );
          });
        }
      );

      req.on('error', (error) => {
        reject(this.createError('Network request to Interswitch failed', 500, error.message));
      });

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }

  async getAccessToken() {
    if (!this.isConfigured()) {
      throw this.createError('Interswitch credentials are not configured', 500);
    }

    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = this.fetchAccessToken();

    try {
      return await this.tokenPromise;
    } finally {
      this.tokenPromise = null;
    }
  }

  async fetchAccessToken() {
    try {
      const responseData = await this.request({
        method: 'POST',
        endpoint: '/passport/oauth/token',
        baseURL: this.oauthBaseURL,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: this.oauthScope
        }).toString(),
        useBasicAuth: true
      });

      if (!responseData.access_token) {
        throw this.createError(
          responseData.error_description || responseData.message || 'Failed to obtain access token',
          500,
          responseData
        );
      }

      this.accessToken = responseData.access_token;
      const expiresIn = Math.max((responseData.expires_in || 3600) - 60, 30);
      this.tokenExpiry = Date.now() + expiresIn * 1000;
      return this.accessToken;
    } catch (error) {
      this.accessToken = null;
      this.tokenExpiry = null;
      this.logResponse('OAuth token error', error.details || error.message);
      if (error instanceof Error && Object.prototype.hasOwnProperty.call(error, 'status')) {
        throw error;
      }
      throw this.createError('Failed to obtain access token', 500, error.message);
    }
  }

  async makeRequest(method, endpoint, data = null, retryOnUnauthorized = true) {
    const token = await this.getAccessToken();
    try {
      const responseData = await this.request({
        method,
        endpoint,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : undefined
      });
      return responseData;
    } catch (error) {
      if (error.status === 401 && retryOnUnauthorized) {
        this.accessToken = null;
        this.tokenExpiry = null;
        return this.makeRequest(method, endpoint, data, false);
      }

      if (error.status === 400) {
        throw this.createError(error.message || 'Invalid request', 400, error.details);
      }

      if (error.status >= 500) {
        throw this.createError(error.message || 'Interswitch service temporarily unavailable', error.status, error.details);
      }

      throw error;
    }
  }

  async verifyBVN(bvn) {
    try {
      const response = await this.makeRequest('POST', this.bvnEndpoint, { bvn });
      return {
        success: true,
        verified: response.responseCode === '00',
        data: response.data || response,
        message: response.message || 'BVN verification completed'
      };
    } catch (error) {
      const endpoint = this.normalizeEndpoint(this.bvnEndpoint);
      return {
        success: false,
        verified: false,
        message: error.status === 404
          ? `BVN endpoint not found at ${endpoint}. Set ISW_BVN_ENDPOINT to the exact route from the Interswitch terminal.`
          : error.message
      };
    }
  }

  async sendOTP(phone, message = 'Your PayChain verification code') {
    try {
      const response = await this.makeRequest('POST', this.sendOtpEndpoint, {
        phoneNumber: phone,
        message
      });

      return {
        success: true,
        tokenId: response.tokenId || response.id,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async verifyOTP(token, otp) {
    try {
      const response = await this.makeRequest('POST', this.verifyOtpEndpoint, {
        token,
        otp
      });

      return {
        success: true,
        verified: response.verified === true || response.responseCode === '00',
        message: response.message || 'OTP verified successfully'
      };
    } catch (error) {
      return {
        success: false,
        verified: false,
        message: error.message
      };
    }
  }

  async initiatePayment(payload) {
    try {
      const {
        amount,
        customerId,
        customerEmail,
        customerPhone,
        reference,
        description = 'Wallet funding'
      } = payload;

      const response = await this.makeRequest('POST', this.paymentEndpoint, {
        amount: Math.round(amount * 100),
        currency: 'NGN',
        customerId,
        customerEmail,
        customerPhone,
        paymentReference: reference,
        description
      });

      return {
        success: true,
        reference: response.paymentReference || reference,
        authorizationUrl: response.authorizationUrl,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = new InterswitchService();
