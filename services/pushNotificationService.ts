import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import Constants from 'expo-constants';

// Configure notification handler behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Helper function to get device model
async function getDeviceModel(): Promise<string | undefined> {
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return Device.modelName || undefined;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export interface PushToken {
  id?: string;
  pro_id: string;
  token: string;
  device_type: 'ios' | 'android' | 'web';
  device_id?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Register device for push notifications
 * @param userId - Professional user ID
 * @returns Promise<string | null> - Push token or null if registration failed
 */
export async function registerForPushNotificationsAsync(
  userId: string
): Promise<string | null> {
  try {
    // Check if device supports notifications
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return null;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permission to receive push notifications was denied');
      return null;
    }

    // Get Expo Push Token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.error('EAS project ID not found in app.json');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const token = tokenData.data;

    // Determine device type
    const deviceType: 'ios' | 'android' | 'web' = Platform.OS === 'ios' 
      ? 'ios' 
      : Platform.OS === 'android' 
      ? 'android' 
      : 'web';

    // Get device ID (optional, for tracking multiple devices)
    const deviceId = await getDeviceModel();

    // Save token to Supabase
    await savePushToken(userId, token, deviceType, deviceId);

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Save push token to Supabase
 */
async function savePushToken(
  userId: string,
  token: string,
  deviceType: 'ios' | 'android' | 'web',
  deviceId?: string
): Promise<boolean> {
  try {
    // Check if token already exists
    const { data: existingToken } = await supabase
      .from('push_tokens')
      .select('id')
      .eq('token', token)
      .single();

    if (existingToken) {
      // Update existing token to active
      const { error } = await supabase
        .from('push_tokens')
        .update({
          pro_id: userId,
          is_active: true,
          device_type: deviceType,
          device_id: deviceId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingToken.id);

      if (error) throw error;
    } else {
      // Insert new token
      const { error } = await supabase
        .from('push_tokens')
        .insert({
          pro_id: userId,
          token,
          device_type: deviceType,
          device_id: deviceId,
          is_active: true,
        });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error saving push token:', error);
    return false;
  }
}

/**
 * Unregister device (deactivate push token)
 */
export async function unregisterPushNotificationsAsync(
  userId: string,
  token?: string
): Promise<boolean> {
  try {
    if (token) {
      // Deactivate specific token
      const { error } = await supabase
        .from('push_tokens')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('pro_id', userId)
        .eq('token', token);

      if (error) throw error;
    } else {
      // Deactivate all tokens for user
      const { error } = await supabase
        .from('push_tokens')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('pro_id', userId);

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error unregistering push notifications:', error);
    return false;
  }
}

/**
 * Get active push tokens for a user
 */
export async function getActivePushTokens(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('pro_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    return data?.map(t => t.token) || [];
  } catch (error) {
    console.error('Error getting active push tokens:', error);
    return [];
  }
}

/**
 * Set up notification listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) {
  // Listen for notifications received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    }
  );

  // Listen for user tapping on or interacting with a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('Notification tapped:', response);
      if (onNotificationTapped) {
        onNotificationTapped(response);
      }
    }
  );

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Schedule a local notification (for testing or immediate notifications)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<string> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Send immediately
  });

  return identifier;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Get notification permissions status
 */
export async function getNotificationPermissions(): Promise<{
  status: 'granted' | 'denied' | 'undetermined';
}> {
  const { status } = await Notifications.getPermissionsAsync();
  return { status: status as 'granted' | 'denied' | 'undetermined' };
}

