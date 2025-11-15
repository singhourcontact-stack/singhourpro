import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { Calendar, Sync, Settings, ExternalLink } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getGoogleCalendarSettings, 
  saveGoogleCalendarSettings,
  initializeGoogleCalendarSync,
  fetchGoogleCalendarEvents,
  syncGoogleCalendarEvents
} from '@/utils/googleCalendarUtils';
import {
  authenticateGoogleCalendar,
  getGoogleCalendarList,
  isGoogleCalendarAuthenticated,
  clearGoogleCalendarTokens
} from '@/services/googleCalendarService';
import { GoogleCalendarSyncSettings } from '@/utils/googleCalendarUtils';

interface GoogleCalendarSyncProps {
  visible: boolean;
  onClose: () => void;
}

export const GoogleCalendarSync: React.FC<GoogleCalendarSyncProps> = ({
  visible,
  onClose,
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<GoogleCalendarSyncSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (visible && user) {
      loadSettings();
    }
  }, [visible, user]);

  const loadSettings = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const syncSettings = await getGoogleCalendarSettings(user.id);
      setSettings(syncSettings);
    } catch (error) {
      console.error('Error loading Google Calendar settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSync = async (enabled: boolean) => {
    if (!user?.id || !settings) return;

    try {
      setLoading(true);
      const updatedSettings = {
        ...settings,
        sync_enabled: enabled,
      };
      
      const success = await saveGoogleCalendarSettings(updatedSettings);
      if (success) {
        setSettings(updatedSettings);
      } else {
        Alert.alert('Erreur', 'Impossible de modifier les paramètres');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoBlock = async (autoBlock: boolean) => {
    if (!user?.id || !settings) return;

    try {
      setLoading(true);
      const updatedSettings = {
        ...settings,
        auto_block_events: autoBlock,
      };
      
      const success = await saveGoogleCalendarSettings(updatedSettings);
      if (success) {
        setSettings(updatedSettings);
      } else {
        Alert.alert('Erreur', 'Impossible de modifier les paramètres');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupGoogleCalendar = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Step 1: Authenticate with Google Calendar via OAuth
      const authResult = await authenticateGoogleCalendar(user.id);
      
      if (!authResult.success) {
        Alert.alert('Erreur', authResult.error || 'Impossible de se connecter à Google Calendar');
        return;
      }

      // Step 2: Get user's calendar list
      const calendarListResult = await getGoogleCalendarList(user.id);
      
      if (!calendarListResult.success || !calendarListResult.calendars || calendarListResult.calendars.length === 0) {
        Alert.alert('Erreur', calendarListResult.error || 'Impossible de récupérer la liste des calendriers');
        return;
      }

      // Step 3: Use primary calendar or first calendar
      const primaryCalendar = calendarListResult.calendars.find(cal => cal.primary) || calendarListResult.calendars[0];
      
      if (!primaryCalendar) {
        Alert.alert('Erreur', 'Aucun calendrier disponible');
        return;
      }

      // Step 4: Initialize sync with selected calendar
      const success = await initializeGoogleCalendarSync(user.id, primaryCalendar.id);
      
      if (success) {
        Alert.alert(
          'Configuration réussie',
          `Calendrier "${primaryCalendar.summary}" connecté avec succès. Vous pouvez maintenant synchroniser vos événements.`,
          [{ text: 'OK', onPress: loadSettings }]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de configurer la synchronisation');
      }
    } catch (error) {
      console.error('Error setting up Google Calendar:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    if (!user?.id || !settings) return;

    try {
      setSyncing(true);
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch events from Google Calendar
      const events = await fetchGoogleCalendarEvents(
        settings.google_calendar_id,
        today,
        today,
        user.id // Pass professional ID for authentication
      );
      
      // Sync events as blocked slots
      const success = await syncGoogleCalendarEvents(user.id, events, today);
      
      if (success) {
        Alert.alert(
          'Synchronisation réussie',
          `${events.length} événement(s) synchronisé(s) et bloqué(s) dans votre calendrier.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de synchroniser les événements');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Calendar size={24} color="#ff3b3b" />
            <Text style={styles.title}>Google Calendar</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {loading ? (
            <Text style={styles.loadingText}>Chargement...</Text>
          ) : !settings ? (
            <View style={styles.setupContainer}>
              <Text style={styles.setupTitle}>Configurer Google Calendar</Text>
              <Text style={styles.setupDescription}>
                Synchronisez vos événements Google Calendar avec votre calendrier professionnel.
                Les événements seront automatiquement bloqués.
              </Text>
              <TouchableOpacity
                style={styles.setupButton}
                onPress={handleSetupGoogleCalendar}
                disabled={loading}
              >
                <ExternalLink size={16} color="#ffffff" />
                <Text style={styles.setupButtonText}>Configurer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.settingsContainer}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Synchronisation</Text>
                  <Text style={styles.settingDescription}>
                    Activer la synchronisation avec Google Calendar
                  </Text>
                </View>
                <Switch
                  value={settings.sync_enabled}
                  onValueChange={handleToggleSync}
                  trackColor={{ false: '#2a2a2a', true: '#ff3b3b' }}
                  thumbColor={settings.sync_enabled ? '#ffffff' : '#666666'}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Blocage automatique</Text>
                  <Text style={styles.settingDescription}>
                    Bloquer automatiquement les créneaux des événements
                  </Text>
                </View>
                <Switch
                  value={settings.auto_block_events}
                  onValueChange={handleToggleAutoBlock}
                  trackColor={{ false: '#2a2a2a', true: '#ff3b3b' }}
                  thumbColor={settings.auto_block_events ? '#ffffff' : '#666666'}
                  disabled={!settings.sync_enabled}
                />
              </View>

              {settings.last_sync && (
                <View style={styles.lastSyncContainer}>
                  <Text style={styles.lastSyncText}>
                    Dernière synchronisation: {new Date(settings.last_sync).toLocaleString('fr-FR')}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
                onPress={handleSyncNow}
                disabled={!settings.sync_enabled || syncing}
              >
                <Sync size={16} color="#ffffff" />
                <Text style={styles.syncButtonText}>
                  {syncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={async () => {
                  Alert.alert(
                    'Déconnecter Google Calendar',
                    'Êtes-vous sûr de vouloir déconnecter votre calendrier Google ?',
                    [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Déconnecter',
                        style: 'destructive',
                        onPress: async () => {
                          if (user?.id) {
                            await clearGoogleCalendarTokens(user.id);
                            setSettings(null);
                            Alert.alert('Succès', 'Google Calendar déconnecté');
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.disconnectButtonText}>Déconnecter Google Calendar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  closeButton: {
    fontSize: 20,
    color: '#666666',
  },
  content: {
    padding: 20,
  },
  loadingText: {
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  setupContainer: {
    alignItems: 'center',
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  setupDescription: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff3b3b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setupButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  settingsContainer: {
    gap: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  lastSyncContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
  },
  lastSyncText: {
    color: '#cccccc',
    fontSize: 14,
    textAlign: 'center',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b3b',
    paddingVertical: 12,
    borderRadius: 8,
  },
  syncButtonDisabled: {
    backgroundColor: '#666666',
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disconnectButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff3b3b',
    alignItems: 'center',
  },
  disconnectButtonText: {
    color: '#ff3b3b',
    fontSize: 14,
    fontWeight: '600',
  },
});
