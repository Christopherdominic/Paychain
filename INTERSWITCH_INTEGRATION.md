# Interswitch API Integration Guide

## Overview

PayChain now integrates with Interswitch API Marketplace for:
- OAuth 2.0 authentication
- BVN verification
- OTP security (SafeToken)
- Payment processing

## Configuration

### Environment Variables

Add to `backend/.env`:
```env
ISW_CLIENT_ID=IKIAC3AAE022C645E039563EE041052526F5C33F6AE9
ISW_CLIENT_SECRET=3DE8472176DB4FC82235731178AFDF81890D3F21
ISW_BASE_URL=https://sandbox.interswitchng.com
```

## Features Implemented

### 1. OAuth 2.0 Token Management

**Service**: `backend/src/services/interswitchService.js`

- Automatic token generation using client credentials
- Base64 encoding of `CLIENT_ID:CLIENT_SECRET`
- Token caching and automatic refresh
- Handles 401 errors by refreshing token

**How it works**:
```javascript
const token = await interswitchService.getAccessToken();
// Token is cached and reused until expiry
```

### 2. BVN Verification

**Endpoint**: `POST /api/auth/register`

**Flow**:
1. User provides BVN during registration
2. Backend calls Interswitch BVN API
3. If verified → user account created
4. If failed → registration rejected

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "bvn": "22222222222"
}
```

**Response** (success):
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "bvnVerified": true
  }
}
```

### 3. OTP Security Integration

**Endpoints**:
- `POST /api/otp/request` - Send OTP
- `POST /api/otp/verify` - Verify OTP

**Flow for Money Transfer**:

1. **Request OTP**:
```json
POST /api/otp/request
{
  "phone": "08012345678",
  "purpose": "transaction"
}
```

Response:
```json
{
  "success": true,
  "sessionId": "session-uuid",
  "message": "OTP sent successfully"
}
```

2. **User receives OTP via SMS**

3. **Verify OTP**:
```json
POST /api/otp/verify
{
  "sessionId": "session-uuid",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "verified": true,
  "message": "OTP verified successfully"
}
```

4. **Send Money with OTP**:
```json
POST /api/wallet/send
{
  "receiverEmail": "receiver@example.com",
  "amount": 1000,
  "type": "fiat",
  "otpSessionId": "session-uuid"
}
```

### 4. Wallet Funding with Interswitch

**Endpoint**: `POST /api/wallet/fund`

**Request**:
```json
{
  "amount": 5000,
  "useInterswitch": true
}
```

**Response**:
```json
{
  "wallet": {
    "balance": 5000
  },
  "reference": "PAY-ABC123",
  "authorizationUrl": "https://sandbox.interswitchng.com/...",
  "message": "Wallet funded successfully"
}
```

## API Error Handling

The service handles all Interswitch API errors:

- **401 Unauthorized**: Automatically refreshes token
- **400 Bad Request**: Returns specific error message
- **500 Server Error**: Returns "Service temporarily unavailable"

## Database Schema Updates

### User Model
```prisma
model User {
  phone       String?
  bvn         String?
  bvnVerified Boolean @default(false)
  otpSessions OTPSession[]
}
```

### OTPSession Model
```prisma
model OTPSession {
  id        String   @id @default(uuid())
  userId    String
  tokenId   String
  phone     String
  purpose   String
  verified  Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

## Testing

### Test BVN Verification
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "bvn": "22222222222"
  }'
```

### Test OTP Flow
```bash
# 1. Request OTP
curl -X POST http://localhost:5000/api/otp/request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "08012345678", "purpose": "transaction"}'

# 2. Verify OTP
curl -X POST http://localhost:5000/api/otp/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "SESSION_ID", "otp": "123456"}'
```

### Test Payment
```bash
curl -X POST http://localhost:5000/api/wallet/fund \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "useInterswitch": true}'
```

## Development Logging

In development mode, all Interswitch API calls are logged:

```
✅ Interswitch OAuth token obtained
📡 Interswitch POST /api/v1/identity/bvn: {...}
❌ Interswitch API Error [400]: {...}
```

## Security Best Practices

✅ Client secret never exposed to frontend
✅ All Interswitch calls happen on backend
✅ Protected routes use JWT middleware
✅ OTP sessions expire after 10 minutes
✅ Tokens cached and auto-refreshed
✅ Comprehensive error handling

## Production Checklist

- [ ] Update to production Interswitch credentials
- [ ] Change `ISW_BASE_URL` to production endpoint
- [ ] Disable development logging
- [ ] Set up proper monitoring
- [ ] Implement rate limiting
- [ ] Add webhook handlers for payment confirmation
- [ ] Set up proper error alerting

## Troubleshooting

### Token Issues
If you get 401 errors, the service automatically refreshes the token. Check logs for OAuth errors.

### BVN Verification Fails
Ensure the BVN format is correct (11 digits). Check Interswitch sandbox documentation for test BVNs.

### OTP Not Received
In sandbox mode, OTPs may not be sent to real phones. Check Interswitch documentation for test phone numbers and OTPs.

### Payment Fails
Check that your Interswitch account has the Bills Payment API enabled in sandbox.

## Support

For Interswitch API issues:
- Documentation: https://sandbox.interswitchng.com/docs
- Support: developer@interswitchgroup.com
