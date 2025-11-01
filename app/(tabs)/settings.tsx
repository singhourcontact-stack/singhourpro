import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Bell,
  Shield,
  CreditCard,
  CircleHelp as HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getNotificationSettings, 
  saveNotificationSettings,
  getUnreadNotificationCount 
} from "@/services/notificationService";
import { DataVerification } from "@/components/DataVerification";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [paymentNotifications, setPaymentNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDataVerification, setShowDataVerification] = useState(false);
  
  const { signOut, user } = useAuth();
  const router = useRouter();

  // Load notification settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const settings = await getNotificationSettings(user.id);
        const count = await getUnreadNotificationCount(user.id);
        
        if (settings) {
          setBookingNotifications(settings.booking_notifications);
          setPaymentNotifications(settings.payment_notifications);
          setMarketingNotifications(settings.marketing_notifications);
          setEmailNotifications(settings.email_notifications);
          setPushNotifications(settings.push_notifications);
          setNotifications(settings.booking_notifications || settings.payment_notifications);
        }
        
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Save notification settings
  const saveNotificationSetting = async (key: string, value: boolean) => {
    if (!user) return;
    
    try {
      await saveNotificationSettings({
        user_id: user.id,
        [key]: value,
      });
    } catch (error) {
      console.error('Error saving notification setting:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    }
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/login");
          } catch (error) {
            Alert.alert("Erreur", "Impossible de se déconnecter.");
          }
        },
      },
    ]);
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    hasSwitch,
    switchValue,
    onSwitchChange,
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {hasSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: "#2a2a2a", true: "#ff3b3b" }}
            thumbColor={switchValue ? "#ffffff" : "#f4f3f4"}
          />
        ) : (
          <ChevronRight size={20} color="#666666" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Paramètres</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMPTE</Text>

          <SettingItem
            icon={<Bell size={20} color="#ff3b3b" />}
            title="Notifications"
            subtitle={`${unreadCount} notifications non lues`}
            hasSwitch
            switchValue={notifications}
            onSwitchChange={(value) => {
              setNotifications(value);
              saveNotificationSetting('booking_notifications', value);
            }}
          />

          <SettingItem
            icon={<Bell size={20} color="#ff3b3b" />}
            title="Réservations"
            subtitle="Notifications pour les nouvelles réservations"
            hasSwitch
            switchValue={bookingNotifications}
            onSwitchChange={(value) => {
              setBookingNotifications(value);
              saveNotificationSetting('booking_notifications', value);
            }}
          />

          <SettingItem
            icon={<CreditCard size={20} color="#ff3b3b" />}
            title="Paiements"
            subtitle="Notifications pour les paiements"
            hasSwitch
            switchValue={paymentNotifications}
            onSwitchChange={(value) => {
              setPaymentNotifications(value);
              saveNotificationSetting('payment_notifications', value);
            }}
          />

          <SettingItem
            icon={<Bell size={20} color="#ff3b3b" />}
            title="Email"
            subtitle="Recevoir les notifications par email"
            hasSwitch
            switchValue={emailNotifications}
            onSwitchChange={(value) => {
              setEmailNotifications(value);
              saveNotificationSetting('email_notifications', value);
            }}
          />

          <SettingItem
            icon={<Bell size={20} color="#ff3b3b" />}
            title="Push"
            subtitle="Notifications push sur l'appareil"
            hasSwitch
            switchValue={pushNotifications}
            onSwitchChange={(value) => {
              setPushNotifications(value);
              saveNotificationSetting('push_notifications', value);
            }}
          />

          <SettingItem
            icon={<Shield size={20} color="#ff3b3b" />}
            title="Confidentialité et sécurité"
            subtitle="Paramètres de confidentialité"
            onPress={() => Alert.alert("Info", "Paramètres de confidentialité")}
          />

          <SettingItem
            icon={<CreditCard size={20} color="#ff3b3b" />}
            title="Paiements"
            subtitle="Gérer vos méthodes de paiement"
            onPress={() => router.push("/payment")}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>

          <SettingItem
            icon={<HelpCircle size={20} color="#ff3b3b" />}
            title="Centre d'aide"
            subtitle="FAQ et support client"
            onPress={() => router.push("/help")}
          />

          <SettingItem
            icon={<Shield size={20} color="#4CAF50" />}
            title="Vérification des données"
            subtitle="Vérifier l'intégrité des données Supabase"
            onPress={() => setShowDataVerification(true)}
          />

          <SettingItem
            icon={<Shield size={20} color="#ff3b3b" />}
            title="Conditions d'utilisation"
            onPress={() =>
              Alert.alert("Info", "Conditions d'utilisation")
            }
          />

          <SettingItem
            icon={<Shield size={20} color="#ff3b3b" />}
            title="Politique de confidentialité"
            onPress={() =>
              Alert.alert("Info", "Politique de confidentialité")
            }
          />
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#ff3b3b" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>SINGHOUR'S Pro</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Data Verification Modal */}
      {showDataVerification && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vérification des Données</Text>
              <TouchableOpacity onPress={() => setShowDataVerification(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <DataVerification />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
    letterSpacing: 1,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#666666",
  },
  settingRight: {
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ff3b3b",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff3b3b",
    marginLeft: 8,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 20,
  },
  appName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff3b3b",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
    color: "#666666",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "#000000",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  modalCloseButton: {
    fontSize: 20,
    color: "#666666",
    fontWeight: "bold",
  },
});
