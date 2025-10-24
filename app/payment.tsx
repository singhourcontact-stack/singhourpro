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

export default function PaymentScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [fiscalName, setFiscalName] = useState("");
  const [fiscalAddress, setFiscalAddress] = useState("");
  const [fiscalNumber, setFiscalNumber] = useState("");

  const [loading, setLoading] = useState(false);

  // Charger les infos existantes depuis Supabase
  useEffect(() => {
    const fetchPaymentInfos = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("payment_infos")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error(error);
        Alert.alert("Erreur", "Impossible de charger vos informations.");
      }

      if (data) {
        setIban(data.iban || "");
        setBic(data.bic || "");
        setPaypalEmail(data.paypal_email || "");
        setFiscalName(data.fiscal_name || "");
        setFiscalAddress(data.fiscal_address || "");
        setFiscalNumber(data.fiscal_number || "");
      }
    };

    fetchPaymentInfos();
  }, [user]);

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

    const { error } = await supabase.from("payment_infos").upsert(
      {
        user_id: user.id,
        iban,
        bic,
        paypal_email: paypalEmail,
        fiscal_name: fiscalName,
        fiscal_address: fiscalAddress,
        fiscal_number: fiscalNumber,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    setLoading(false);

    if (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible d’enregistrer vos informations.");
    } else {
      Alert.alert("Succès", "Vos informations de paiement ont été mises à jour.", [
        { text: "OK", onPress: () => router.back() },
      ]);
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
            <TextInput
              style={styles.input}
              value={paypalEmail}
              onChangeText={setPaypalEmail}
              placeholder="exemple@paypal.com"
              placeholderTextColor="#666666"
              keyboardType="email-address"
              autoCapitalize="none"
            />
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
});
