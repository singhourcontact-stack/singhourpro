import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

// PayPal API Configuration
const getPayPalConfig = () => {
  const config = Constants?.expoConfig?.extra || {};
  return {
    clientId: config.paypalClientId || process.env.EXPO_PUBLIC_PAYPAL_CLIENT_ID || '',
    secret: config.paypalSecret || process.env.EXPO_PUBLIC_PAYPAL_SECRET || '',
    environment: config.paypalEnvironment || process.env.EXPO_PUBLIC_PAYPAL_ENV || 'sandbox',
  };
};

const getPayPalBaseUrl = (environment: string) => {
  return environment === 'production' 
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
};

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Get PayPal OAuth access token
 */
async function getPayPalAccessToken(): Promise<string | null> {
  try {
    const config = getPayPalConfig();
    if (!config.clientId || !config.secret) {
      console.error('PayPal credentials not configured');
      return null;
    }

    const baseUrl = getPayPalBaseUrl(config.environment);
    const credentials = `${config.clientId}:${config.secret}`;
    const base64Credentials = btoa(credentials);

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64Credentials}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`PayPal token request failed: ${response.statusText}`);
    }

    const data: PayPalTokenResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    return null;
  }
}

/**
 * Verify PayPal account email
 */
export async function verifyPayPalAccount(email: string): Promise<{ valid: boolean; account?: any }> {
  try {
    // Note: PayPal doesn't have a direct API to verify email
    // We'll use a different approach - verify during OAuth connection
    
    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false };
    }

    // In a real implementation, you would:
    // 1. Redirect user to PayPal OAuth
    // 2. Get user info from PayPal after authentication
    // 3. Verify the email matches
    
    return { valid: true, account: { email, verified: false } };
  } catch (error) {
    console.error('Error verifying PayPal account:', error);
    return { valid: false };
  }
}

/**
 * Connect PayPal account via OAuth
 */
export async function connectPayPalAccountOAuth(): Promise<{ success: boolean; email?: string; error?: string }> {
  try {
    const config = getPayPalConfig();
    if (!config.clientId) {
      return { success: false, error: 'PayPal Client ID not configured' };
    }

    const baseUrl = getPayPalBaseUrl(config.environment);
    const redirectUri = 'singhours://paypal-callback'; // Custom URL scheme
    
    // PayPal OAuth URL
    const authUrl = `${baseUrl === 'https://api-m.paypal.com' ? 'https://www.paypal.com' : 'https://www.sandbox.paypal.com'}/connect?flowEntry=static&client_id=${config.clientId}&response_type=code&scope=openid%20email&redirect_uri=${encodeURIComponent(redirectUri)}`;

    // Open PayPal OAuth in browser
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      // Extract authorization code from callback URL
      const urlParams = new URLSearchParams(result.url.split('?')[1]);
      const code = urlParams.get('code');

      if (code) {
        // Exchange code for access token and get user info
        const accessToken = await getPayPalAccessToken();
        if (!accessToken) {
          return { success: false, error: 'Failed to get access token' };
        }

        // Get user info from PayPal
        const userInfoResponse = await fetch(`${baseUrl}/v2/identity/oauth2/userinfo?schema=paypalv1.1`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          return { success: true, email: userInfo.email || userInfo.emails?.[0]?.value };
        }
      }
    }

    return { success: false, error: 'PayPal authentication cancelled or failed' };
  } catch (error: any) {
    console.error('Error connecting PayPal account:', error);
    return { success: false, error: error.message || 'PayPal connection failed' };
  }
}

/**
 * Create PayPal payment order
 */
export async function createPayPalOrder(
  amount: number,
  currency: string = 'EUR',
  description?: string
): Promise<{ success: boolean; orderId?: string; approvalUrl?: string; error?: string }> {
  try {
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      return { success: false, error: 'Failed to authenticate with PayPal' };
    }

    const config = getPayPalConfig();
    const baseUrl = getPayPalBaseUrl(config.environment);

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
        description: description || 'Payment for service',
      }],
      application_context: {
        brand_name: "Singhours Pro",
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: 'singhours://paypal-return',
        cancel_url: 'singhours://paypal-cancel',
      },
    };

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `order-${Date.now()}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create PayPal order');
    }

    const order = await response.json();
    
    // Find approval URL in links
    const approvalLink = order.links?.find((link: any) => link.rel === 'approve');
    
    return {
      success: true,
      orderId: order.id,
      approvalUrl: approvalLink?.href,
    };
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    return { success: false, error: error.message || 'Failed to create payment order' };
  }
}

/**
 * Capture PayPal payment
 */
export async function capturePayPalOrder(orderId: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      return { success: false, error: 'Failed to authenticate with PayPal' };
    }

    const config = getPayPalConfig();
    const baseUrl = getPayPalBaseUrl(config.environment);

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to capture PayPal order');
    }

    const capture = await response.json();
    
    if (capture.status === 'COMPLETED') {
      return {
        success: true,
        transactionId: capture.id || capture.purchase_units?.[0]?.payments?.captures?.[0]?.id,
      };
    }

    return { success: false, error: `Payment status: ${capture.status}` };
  } catch (error: any) {
    console.error('Error capturing PayPal order:', error);
    return { success: false, error: error.message || 'Failed to capture payment' };
  }
}
