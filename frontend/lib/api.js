const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT_MS = 15000;

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const buildHeaders = (auth = false) => {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const request = async (path, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Request failed', status: res.status };
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      return { error: 'Request timed out. Please try again.' };
    }

    return { error: 'Network error. Please try again.' };
  } finally {
    clearTimeout(timeout);
  }
};

const api = {
  async register({ name, email, password, phone }) {
    return request('/api/auth/register', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ name, email, password, phone })
    });
  },

  async login(email, password) {
    return request('/api/auth/login', {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ email, password })
    });
  },

  async getMe() {
    return request('/api/auth/me', {
      headers: buildHeaders(true)
    });
  },

  async getWallet() {
    return request('/api/wallet', {
      headers: buildHeaders(true)
    });
  },

  async fundWallet(amount) {
    return request('/api/wallet/fund', {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify({ amount })
    });
  },

  async sendMoney({ receiverEmail, amount, type = 'fiat', sessionId, otp, otpSessionId }) {
    return request('/api/wallet/send', {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify({
        receiverEmail,
        amount,
        type,
        sessionId,
        otp,
        otpSessionId
      })
    });
  },

  async requestOtp(phone, purpose = 'transaction') {
    return request('/api/otp/request', {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify({ phone, purpose })
    });
  },

  async verifyOtp(sessionId, otp) {
    return request('/api/otp/verify', {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify({ sessionId, otp })
    });
  },

  async getTransactions() {
    return request('/api/transactions', {
      headers: buildHeaders(true)
    });
  },

  async createStripePayment(amount) {
    return request('/api/payment/stripe/create', {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify({ amount })
    });
  },

  async confirmStripePayment(paymentIntentId) {
    return request('/api/payment/stripe/confirm', {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify({ paymentIntentId })
    });
  }
};

export default api;
