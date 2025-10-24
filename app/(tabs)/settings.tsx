import React, { useState } from "react";
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

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const { signOut } = useAuth();
  const router = useRouter();

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
            subtitle="Gérer vos préférences de notifications"
            hasSwitch
            switchValue={notifications}
            onSwitchChange={setNotifications}
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
});
