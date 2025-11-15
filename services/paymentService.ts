import { supabase } from '@/lib/supabase';
import { 
  verifyPayPalAccount, 
  connectPayPalAccountOAuth,
  createPayPalOrder,
  capturePayPalOrder 
} from './paypalService';

export interface PaymentInfo {
  id?: string;
  pro_id: string;
  rib?: string;
  iban?: string;
  bic?: string;
  paypal_email?: string;
  paypal_connected?: boolean;
  fiscal_name?: string;
  fiscal_address?: string;
  fiscal_number?: string;
  stripe_account_id?: string;
  stripe_connected?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PayPalAccountInfo {
  email: string;
  verified: boolean;
  account_type: 'personal' | 'business';
  currency: string;
}

/**
 * Get payment information for a user
 */
export async function getPaymentInfo(userId: string): Promise<PaymentInfo | null> {
  try {
    const { data, error } = await supabase
      .from('payment_infos')
      .select('*')
      .eq('pro_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching payment info:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting payment info:', error);
    return null;
  }
}

/**
 * Save or update payment information
 */
export async function savePaymentInfo(paymentInfo: Partial<PaymentInfo>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('payment_infos')
      .upsert({
        ...paymentInfo,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'pro_id' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving payment info:', error);
    return false;
  }
}

/**
 * Connect PayPal account via OAuth
 * Uses real PayPal OAuth flow
 */
export async function connectPayPalAccount(userId: string, paypalEmail?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Option 1: Use OAuth flow (recommended)
    const oauthResult = await connectPayPalAccountOAuth();
    
    if (oauthResult.success && oauthResult.email) {
      // Save the verified PayPal email from OAuth
      const success = await savePaymentInfo({
        pro_id: userId,
        paypal_email: oauthResult.email,
        paypal_connected: true,
      });

      if (success) {
        return { success: true };
      } else {
        return { success: false, error: 'Impossible de sauvegarder la connexion PayPal' };
      }
    }

    // Option 2: Fallback to email validation (if provided)
    if (paypalEmail) {
      const validation = await verifyPayPalAccount(paypalEmail);
      
      if (!validation.valid) {
        return { success: false, error: 'Email PayPal invalide' };
      }

      const success = await savePaymentInfo({
        pro_id: userId,
        paypal_email: paypalEmail,
        paypal_connected: true,
      });

      if (success) {
        return { success: true };
      } else {
        return { success: false, error: 'Impossible de connecter le compte PayPal' };
      }
    }

    return { success: false, error: oauthResult.error || 'Échec de la connexion PayPal' };
  } catch (error: any) {
    console.error('Error connecting PayPal account:', error);
    return { success: false, error: error.message || 'Erreur de connexion PayPal' };
  }
}

/**
 * Disconnect PayPal account
 */
export async function disconnectPayPalAccount(userId: string): Promise<boolean> {
  try {
    const success = await savePaymentInfo({
      pro_id: userId,
      paypal_connected: false,
      paypal_email: null,
    });

    return success;
  } catch (error) {
    console.error('Error disconnecting PayPal account:', error);
    return false;
  }
}

/**
 * Get PayPal account status
 */
export async function getPayPalStatus(userId: string): Promise<{ connected: boolean; email?: string }> {
  try {
    const paymentInfo = await getPaymentInfo(userId);
    return {
      connected: paymentInfo?.paypal_connected || false,
      email: paymentInfo?.paypal_email,
    };
  } catch (error) {
    console.error('Error getting PayPal status:', error);
    return { connected: false };
  }
}

/**
 * Process PayPal payment with order creation and capture
 * This replaces the mock 3D Secure payment with real PayPal Orders API
 */
export async function processPayPalPayment(
  amount: number,
  currency: string = 'EUR',
  description?: string,
  orderId?: string
): Promise<{ success: boolean; transactionId?: string; approvalUrl?: string; error?: string }> {
  try {
    // If orderId is provided, capture the existing order
    if (orderId) {
      const captureResult = await capturePayPalOrder(orderId);
      return captureResult;
    }

    // Otherwise, create a new order
    const orderResult = await createPayPalOrder(amount, currency, description);
    
    if (orderResult.success) {
      return {
        success: true,
        transactionId: orderResult.orderId,
        approvalUrl: orderResult.approvalUrl,
      };
    }

    return { success: false, error: orderResult.error || 'Failed to create PayPal order' };
  } catch (error: any) {
    console.error('Error processing PayPal payment:', error);
    return { success: false, error: error.message || 'Erreur de paiement PayPal' };
  }
}

/**
 * Process 3D Secure payment via Stripe
 * Note: For full 3D Secure, you'll need to integrate Stripe SDK
 * This is a placeholder that shows the structure
 */
export async function process3DSecurePayment(
  amount: number,
  currency: string = 'EUR',
  paymentMethod: 'paypal' | 'stripe' = 'stripe'
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    if (paymentMethod === 'paypal') {
      // PayPal doesn't have traditional 3D Secure, but uses its own security
      // Use the PayPal payment processing instead
      return await processPayPalPayment(amount, currency);
    }

    // Stripe 3D Secure implementation would go here
    // This requires @stripe/stripe-react-native package
    // For now, return an error indicating Stripe needs to be configured
    return {
      success: false,
      error: 'Stripe 3D Secure requires Stripe SDK configuration. Please install @stripe/stripe-react-native and configure your Stripe keys.',
    };
  } catch (error: any) {
    console.error('Error processing 3D Secure payment:', error);
    return { success: false, error: error.message || 'Erreur de paiement 3D Secure' };
  }
}
