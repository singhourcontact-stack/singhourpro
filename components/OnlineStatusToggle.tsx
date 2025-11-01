import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';
import { toggleOnlineStatus, getProfile } from '@/services/profileService';
import { useAuth } from '@/contexts/AuthContext';

interface OnlineStatusToggleProps {
  onStatusChange?: (isOnline: boolean) => void;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const OnlineStatusToggle: React.FC<OnlineStatusToggleProps> = ({
  onStatusChange,
  showLabel = true,
  size = 'medium',
}) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadOnlineStatus();
    }
  }, [user]);

  const loadOnlineStatus = async () => {
    if (!user?.id) return;

    try {
      // Note: is_online column doesn't exist in your database
      // Set default to false for UI compatibility
      setIsOnline(false);
    } catch (error) {
      console.error('Error loading online status:', error);
    }
  };

  const handleToggle = async (value: boolean) => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      // Note: is_online column doesn't exist in your database
      // This is kept for UI compatibility but doesn't update the database
      const success = await toggleOnlineStatus(user.id, value);
      
      if (success) {
        setIsOnline(value);
        onStatusChange?.(value);
      } else {
        // Revert on failure
        setIsOnline(!value);
      }
    } catch (error) {
      console.error('Error toggling online status:', error);
      // Revert on error
      setIsOnline(!value);
    } finally {
      setLoading(false);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          text: styles.smallText,
          icon: 16,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          text: styles.largeText,
          icon: 24,
        };
      default:
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
          icon: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          {isOnline ? (
            <Wifi size={sizeStyles.icon} color="#00C851" />
          ) : (
            <WifiOff size={sizeStyles.icon} color="#666666" />
          )}
          <Text style={[styles.statusText, sizeStyles.text, { color: isOnline ? '#00C851' : '#666666' }]}>
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </Text>
        </View>
      )}
      
      <Switch
        value={isOnline}
        onValueChange={handleToggle}
        disabled={loading}
        trackColor={{ false: '#2a2a2a', true: '#00C851' }}
        thumbColor={isOnline ? '#ffffff' : '#666666'}
        style={styles.switch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallContainer: {
    padding: 8,
  },
  mediumContainer: {
    padding: 12,
  },
  largeContainer: {
    padding: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  switch: {
    marginLeft: 12,
  },
});
