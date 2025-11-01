import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, CreditCard, FileText } from "lucide-react-native";
import { supabase } from "@/lib/supabase"; // ✅ ton client supabase
import { useAuth } from "@/contexts/AuthContext"; // ✅ hook pour récupérer l'user connecté
import { 
  getPaymentInfo, 
  savePaymentInfo, 
  connectPayPalAccount, 
  disconnectPayPalAccount, 
  getPayPalStatus,
  process3DSecurePayment 
} from "@/services/paymentService";

export default function PaymentScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [fiscalName, setFiscalName] = useState("");
  const [fiscalAddress, setFiscalAddress] = useState("");
  const [fiscalNumber, setFiscalNumber] = useState("");
  const [paypalConnected, setPaypalConnected] = useState(false);
  const [connectingPayPal, setConnectingPayPal] = useState(false);

  const [loading, setLoading] = useState(false);

  // Charger les infos existantes depuis Supabase
  useEffect(() => {
    const fetchPaymentInfos = async () => {
      if (!user) return;

      try {
        const paymentInfo = await getPaymentInfo(user.id);
        
        if (paymentInfo) {
          setIban(paymentInfo.iban || "");
          setBic(paymentInfo.bic || "");
          setPaypalEmail(paymentInfo.paypal_email || "");
          setFiscalName(paymentInfo.fiscal_name || "");
          setFiscalAddress(paymentInfo.fiscal_address || "");
          setFiscalNumber(paymentInfo.fiscal_number || "");
          setPaypalConnected(paymentInfo.paypal_connected || false);
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Erreur", "Impossible de charger vos informations.");
      }
    };

    fetchPaymentInfos();
  }, [user]);

  // Connecter PayPal
  const handleConnectPayPal = async () => {
    if (!user || !paypalEmail) {
      Alert.alert("Erreur", "Veuillez saisir votre email PayPal.");
      return;
    }

    setConnectingPayPal(true);
    
    try {
      const result = await connectPayPalAccount(user.id, paypalEmail);
      
      if (result.success) {
        setPaypalConnected(true);
        Alert.alert("Succès", "Compte PayPal connecté avec succès !");
      } else {
        Alert.alert("Erreur", result.error || "Impossible de connecter le compte PayPal.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue lors de la connexion.");
    } finally {
      setConnectingPayPal(false);
    }
  };

  // Déconnecter PayPal
  const handleDisconnectPayPal = async () => {
    if (!user) return;

    try {
      const success = await disconnectPayPalAccount(user.id);
      
      if (success) {
        setPaypalConnected(false);
        setPaypalEmail("");
        Alert.alert("Succès", "Compte PayPal déconnecté.");
      } else {
        Alert.alert("Erreur", "Impossible de déconnecter le compte PayPal.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue lors de la déconnexion.");
    }
  };

  // Sauvegarder ou mettre à jour
  const handleSave = async () => {
    if (!user) {
      Alert.alert("Erreur", "Vous devez être connecté.");
      return;
    }

    if (!iban && !paypalEmail) {
      Alert.alert("Erreur", "Veuillez renseigner au moins un moyen de paiement.");
      return;
    }

    setLoading(true);

    try {
      const success = await savePaymentInfo({
        user_id: user.id,
        iban,
        bic,
        paypal_email: paypalEmail,
        fiscal_name: fiscalName,
        fiscal_address: fiscalAddress,
        fiscal_number: fiscalNumber,
      });

      if (success) {
        Alert.alert("Succès", "Vos informations de paiement ont été mises à jour.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Erreur", "Impossible d'enregistrer vos informations.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Informations de paiement</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Section Paiement */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Moyens de paiement</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>IBAN</Text>
            <View style={styles.inputWrapper}>
              <CreditCard size={20} color="#666666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={iban}
                onChangeText={setIban}
                placeholder="FR76 3000 6000 ..."
                placeholderTextColor="#666666"
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>BIC</Text>
            <TextInput
              style={styles.input}
              value={bic}
              onChangeText={setBic}
              placeholder="AGRIFRPPXXX"
              placeholderTextColor="#666666"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email PayPal</Text>
            <View style={styles.paypalContainer}>
              <TextInput
                style={[styles.input, paypalConnected && styles.connectedInput]}
                value={paypalEmail}
                onChangeText={setPaypalEmail}
                placeholder="exemple@paypal.com"
                placeholderTextColor="#666666"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!paypalConnected}
              />
              {paypalConnected ? (
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={handleDisconnectPayPal}
                >
                  <Text style={styles.disconnectButtonText}>Déconnecter</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.connectButton, connectingPayPal && styles.connectButtonDisabled]}
                  onPress={handleConnectPayPal}
                  disabled={connectingPayPal || !paypalEmail}
                >
                  {connectingPayPal ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.connectButtonText}>Connecter</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
            {paypalConnected && (
              <Text style={styles.connectedText}>✅ Compte PayPal connecté</Text>
            )}
          </View>
        </View>

        {/* Section Fiscale */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Informations fiscales</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom fiscal</Text>
            <View style={styles.inputWrapper}>
              <FileText size={20} color="#666666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={fiscalName}
                onChangeText={setFiscalName}
                placeholder="Jean Dupont"
                placeholderTextColor="#666666"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse fiscale</Text>
            <TextInput
              style={styles.input}
              value={fiscalAddress}
              onChangeText={setFiscalAddress}
              placeholder="10 rue de Paris, 75000 Paris"
              placeholderTextColor="#666666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numéro fiscal</Text>
            <TextInput
              style={styles.input}
              value={fiscalNumber}
              onChangeText={setFiscalNumber}
              placeholder="123456789"
              placeholderTextColor="#666666"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Bouton Sauvegarde */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#ffffff",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveButton: {
    backgroundColor: "#ff3b3b",
    borderRadius: 12,
    paddingVertical: 18,
    marginHorizontal: 20,
    alignItems: "center",
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  paypalContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  connectedInput: {
    backgroundColor: "#2a2a2a",
    opacity: 0.7,
  },
  connectButton: {
    backgroundColor: "#0070ba",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  connectButtonDisabled: {
    opacity: 0.6,
  },
  connectButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  disconnectButton: {
    backgroundColor: "#ff3b3b",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  disconnectButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  connectedText: {
    color: "#00C851",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});
