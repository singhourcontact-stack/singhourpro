# 💳 PayPal Integration Setup Guide

## 📋 Overview

This app now has **real PayPal integration** with OAuth authentication and payment processing. This replaces the previous mock implementation.

## 🔧 Configuration Steps

### 1. Get PayPal API Credentials

1. **Go to PayPal Developer Dashboard:**
   - Visit: https://developer.paypal.com/
   - Sign in with your PayPal account (or create one)

2. **Create a New App:**
   - Navigate to **Dashboard** → **My Apps & Credentials**
   - Click **"Create App"**
   - Give it a name (e.g., "Singhours Pro")
   - Select **"Sandbox"** for testing or **"Live"** for production

3. **Get Your Credentials:**
   - After creating the app, you'll see:
     - **Client ID**
     - **Secret**
   - Copy both values

### 2. Configure in App

Update `app.json` with your PayPal credentials:

```json
"extra": {
  "paypalClientId": "YOUR_PAYPAL_CLIENT_ID_HERE",
  "paypalSecret": "YOUR_PAYPAL_SECRET_HERE",
  "paypalEnvironment": "sandbox",  // or "production" for live
  ...
}
```

### 3. Set Up URL Schemes (for OAuth Callbacks)

The app is configured with URL scheme `singhours://` for PayPal OAuth callbacks.

**For iOS:**
- Already configured in `app.json` with `"scheme": "singhours"`

**For Android:**
- Already configured with package name

### 4. Configure PayPal App Redirect URLs

In your PayPal app settings, add these redirect URLs:
- `singhours://paypal-callback` (for OAuth)
- `singhours://paypal-return` (for payment returns)
- `singhours://paypal-cancel` (for payment cancellation)

---

## 🚀 How to Use

### Connecting PayPal Account

1. **Via OAuth (Recommended):**
   - User clicks "Connecter (OAuth)" button
   - PayPal login page opens in browser
   - User logs in and authorizes
   - App receives callback with verified email
   - Account is automatically connected

2. **Via Email (Fallback):**
   - User enters PayPal email
   - Clicks "Avec email" button
   - Email is validated and saved

### Processing Payments

Use the new `processPayPalPayment()` function:

```typescript
import { processPayPalPayment } from '@/services/paymentService';

// Create a payment order
const result = await processPayPalPayment(
  100.00,  // Amount
  'EUR',   // Currency
  'Service booking payment'  // Description
);

if (result.success && result.approvalUrl) {
  // Open approvalUrl in browser for user to approve payment
  // After approval, capture the order using result.transactionId (orderId)
  
  const captureResult = await processPayPalPayment(
    100.00,
    'EUR',
    undefined,
    result.transactionId  // Use orderId to capture
  );
}
```

---

## 🔐 Security Notes

1. **Never commit credentials to Git:**
   - Use environment variables or secure storage
   - In production, use Expo Secrets or similar

2. **Keep secrets secure:**
   - PayPal Secret should never be exposed to client
   - Consider using a backend proxy for sensitive operations

3. **Sandbox vs Production:**
   - Use `sandbox` for testing
   - Switch to `production` only when ready

---

## 📝 API Features Implemented

### ✅ Completed:
- ✅ PayPal OAuth authentication
- ✅ Account verification via OAuth
- ✅ Create PayPal orders
- ✅ Capture payments
- ✅ Payment status tracking
- ✅ Disconnect PayPal accounts

### ⚠️ 3D Secure Note:
- PayPal uses its own security (not traditional 3D Secure)
- For true 3D Secure, you'll need **Stripe integration**
- Stripe requires `@stripe/stripe-react-native` package

---

## 🐛 Troubleshooting

### "PayPal Client ID not configured"
- Make sure you've added credentials to `app.json`
- Restart the Metro bundler after changes

### "Failed to authenticate with PayPal"
- Check your Client ID and Secret
- Verify environment (sandbox/production) matches your app type
- Check PayPal app is active in developer dashboard

### OAuth callback not working
- Verify URL scheme is configured correctly
- Check redirect URLs match in PayPal app settings
- Ensure app is running (not just web preview)

---

## 📚 Resources

- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [PayPal Orders API](https://developer.paypal.com/docs/api/orders/v2/)
- [PayPal OAuth Scopes](https://developer.paypal.com/docs/api/overview/#oauth-20-scopes)

---

## ✅ Next Steps

1. **Get PayPal credentials** from developer dashboard
2. **Add credentials** to `app.json`
3. **Test OAuth flow** in sandbox mode
4. **Test payment processing** with sandbox accounts
5. **Switch to production** when ready to go live

---

**Note:** The PayPal integration is now fully functional and uses real PayPal APIs instead of mocks! 🎉
