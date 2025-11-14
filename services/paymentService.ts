import { supabase } from '@/lib/supabase';

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
 * Connect PayPal account (mock implementation)
 * In a real app, this would integrate with PayPal API
 */
export async function connectPayPalAccount(userId: string, paypalEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Mock PayPal connection validation
    // In real implementation, you would:
    // 1. Call PayPal API to verify the account
    // 2. Get account information
    // 3. Store the connection status
    
    const mockValidation = await validatePayPalAccount(paypalEmail);
    
    if (!mockValidation.valid) {
      return { success: false, error: 'Email PayPal invalide ou compte non vérifié' };
    }

    // Update payment info with PayPal connection
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
  } catch (error: any) {
    console.error('Error connecting PayPal account:', error);
    return { success: false, error: error.message || 'Erreur de connexion PayPal' };
  }
}

/**
 * Mock PayPal account validation
 * In real implementation, this would call PayPal API
 */
async function validatePayPalAccount(email: string): Promise<{ valid: boolean; account?: PayPalAccountInfo }> {
  // Mock validation - in real app, call PayPal API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple email validation for demo
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      
      if (isValidEmail) {
        resolve({
          valid: true,
          account: {
            email,
            verified: true,
            account_type: 'business',
            currency: 'EUR',
          }
        });
      } else {
        resolve({ valid: false });
      }
    }, 1000);
  });
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
 * Process 3D Secure payment (mock implementation)
 * In real implementation, this would integrate with Stripe or PayPal 3D Secure
 */
export async function process3DSecurePayment(
  amount: number,
  currency: string = 'EUR',
  paymentMethod: 'paypal' | 'stripe' = 'paypal'
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    // Mock 3D Secure processing
    // In real implementation, you would:
    // 1. Create payment intent with 3D Secure enabled
    // 2. Handle authentication challenge
    // 3. Complete payment
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock successful payment
        resolve({
          success: true,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
      }, 2000);
    });
  } catch (error: any) {
    console.error('Error processing 3D Secure payment:', error);
    return { success: false, error: error.message || 'Erreur de paiement 3D Secure' };
  }
}
