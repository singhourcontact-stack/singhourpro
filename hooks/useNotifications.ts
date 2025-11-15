import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  unregisterPushNotificationsAsync,
} from '@/services/pushNotificationService';
import { useRouter } from 'expo-router';

/**
 * Hook to manage push notifications for the current user
 */
export function useNotifications() {
  const { user } = useAuth();
  const router = useRouter();
  const notificationListener = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Register for push notifications when user is logged in
    if (user?.id) {
      registerForPushNotificationsAsync(user.id).catch((error) => {
        console.error('Error registering for push notifications:', error);
      });

      // Set up notification listeners
      notificationListener.current = setupNotificationListeners(
        // On notification received
        (notification) => {
          console.log('Notification received:', notification);
          // You can show an in-app notification or update UI here
        },
        // On notification tapped
        (response) => {
          console.log('Notification tapped:', response);
          const data = response.notification.request.content.data;

          // Navigate based on notification type
          if (data?.type === 'booking') {
            router.push('/(tabs)/bookings');
          } else if (data?.type === 'payment') {
            router.push('/(tabs)/settings');
          }
        }
      );
    }

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationListener.current();
        notificationListener.current = null;
      }

      // Unregister when user logs out (optional, keep tokens active for logout)
      // if (!user) {
      //   unregisterPushNotificationsAsync(user?.id || '').catch(console.error);
      // }
    };
  }, [user?.id, router]);

  return null;
}

