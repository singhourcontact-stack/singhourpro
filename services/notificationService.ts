import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import { getActivePushTokens } from './pushNotificationService';
import Constants from 'expo-constants';

export interface NotificationSettings {
  id?: string;
  pro_id: string;
  booking_notifications: boolean;
  payment_notifications: boolean;
  marketing_notifications: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  pro_id: string;
  type: 'booking' | 'payment' | 'system' | 'marketing';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

/**
 * Get notification settings for a user
 */
export async function getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('pro_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching notification settings:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return null;
  }
}

/**
 * Save notification settings
 */
export async function saveNotificationSettings(settings: Partial<NotificationSettings>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .upsert({
        ...settings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'pro_id' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return false;
  }
}

/**
 * Get notifications for a user
 */
export async function getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('pro_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('pro_id', userId)
      .eq('read', false);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

/**
 * Create a new notification
 */
export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  data?: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        pro_id: userId,
        type,
        title,
        message,
        data,
        read: false,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

/**
 * Send push notification via Expo Push Notification service
 */
async function sendPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data?: any
): Promise<boolean> {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
      }),
    });

    const result = await response.json();
    return result.data?.status === 'ok';
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

/**
 * Send booking notification to professional (database + push)
 */
export async function sendBookingNotification(
  professionalId: string,
  clientName: string,
  serviceTitle: string,
  bookingDate: string,
  bookingTime: string
): Promise<boolean> {
  try {
    const title = 'Nouvelle réservation';
    const message = `${clientName} a réservé "${serviceTitle}" le ${bookingDate} à ${bookingTime}`;

    const notificationData = {
      clientName,
      serviceTitle,
      bookingDate,
      bookingTime,
      type: 'booking',
    };

    // 1. Save to database
    const dbSuccess = await createNotification(
      professionalId,
      'booking',
      title,
      message,
      notificationData
    );

    if (!dbSuccess) {
      console.error('Failed to save notification to database');
    }

    // 2. Check notification settings
    const settings = await getNotificationSettings(professionalId);
    if (settings && !settings.push_notifications) {
      // User has disabled push notifications
      return dbSuccess;
    }

    // 3. Send push notification to all active devices
    const pushTokens = await getActivePushTokens(professionalId);
    if (pushTokens.length > 0) {
      const pushPromises = pushTokens.map(token =>
        sendPushNotification(token, title, message, notificationData)
      );
      await Promise.all(pushPromises);
    }

    return dbSuccess;
  } catch (error) {
    console.error('Error sending booking notification:', error);
    return false;
  }
}

/**
 * Send payment notification
 */
export async function sendPaymentNotification(
  userId: string,
  amount: number,
  currency: string = 'EUR',
  status: 'completed' | 'pending' | 'failed'
): Promise<boolean> {
  try {
    const title = status === 'completed' ? 'Paiement reçu' : 
                  status === 'pending' ? 'Paiement en attente' : 'Échec de paiement';
    
    const message = status === 'completed' ? 
      `Paiement de ${amount} ${currency} reçu avec succès` :
      status === 'pending' ?
      `Paiement de ${amount} ${currency} en cours de traitement` :
      `Le paiement de ${amount} ${currency} a échoué`;

    return await createNotification(
      userId,
      'payment',
      title,
      message,
      { amount, currency, status }
    );
  } catch (error) {
    console.error('Error sending payment notification:', error);
    return false;
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('pro_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}
