import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    console.log("LoginScreen ▶ handleLogin déclenché avec:", { email, password });

    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Champs manquants",
        text2: "Veuillez remplir tous les champs.",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email.trim(), password.trim()); // { user?, error? }

      console.log("LoginScreen ▶ Résultat signIn:", result);

      // safe destructuring after checking
      if (result.error) {
        console.error("LoginScreen ▶ signIn error", result.error);
        Toast.show({
          type: "error",
          text1: "Erreur de connexion",
          text2: result.error.message || "Impossible de se connecter.",
        });
        return;
      }
      if (result.user) {
        Toast.show({
          type: "success",
          text1: "Connexion réussie ✅",
          text2: "Bienvenue " + (result.user.email || ""),
        });
        console.log("LoginScreen ▶ Navigation vers /tabs");
        await router.replace("/(tabs)");
      } else {
        console.warn("LoginScreen ▶ signIn returned no user and no error");
        Toast.show({
          type: "error",
          text1: "Utilisateur introuvable",
          text2: "Vérifiez vos identifiants.",
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erreur inattendue",
        text2: "Veuillez réessayer plus tard.",
      });
      console.error("LoginScreen ▶ Erreur inattendue:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.logo}>SINGHOUR'S</Text>
            <Text style={styles.subtitle}>Connexion</Text>
          </View>

          <View style={styles.form}>
            {/* Champ email */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#666666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Champ mot de passe */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Mot de passe"
                  placeholderTextColor="#666666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#666666" />
                  ) : (
                    <Eye size={20} color="#666666" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Bouton connexion */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? "Connexion..." : "Se connecter"}
              </Text>
            </TouchableOpacity>

            {/* Lien inscription */}
            <View style={styles.registerLink}>
              <Text style={styles.registerText}>Pas encore de compte ? </Text>
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.registerLinkText}>S'inscrire</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  header: { alignItems: "center", marginBottom: 40 },
  logo: { fontSize: 32, fontWeight: "bold", color: "#ff3b3b", letterSpacing: 2, marginBottom: 8 },
  subtitle: { fontSize: 18, color: "#ffffff", fontWeight: "500" },
  form: { width: "100%" },
  inputContainer: { marginBottom: 20 },
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
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: "#ffffff" },
  passwordInput: { paddingRight: 40 },
  eyeIcon: { position: "absolute", right: 16, padding: 4 },
  loginButton: {
    backgroundColor: "#ff3b3b",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  registerLink: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
  registerText: { color: "#666666", fontSize: 14 },
  registerLinkText: { color: "#ff3b3b", fontSize: 14, fontWeight: "600" },
});
