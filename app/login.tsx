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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { Mail, Lock, Eye, EyeOff, Phone } from "lucide-react-native";
import { Image } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle, signInWithApple, resetPassword } from "@/services/authService";
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Connexion Google réussie ✅",
          text2: "Bienvenue !",
        });
        await router.replace("/(tabs)");
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur Google",
          text2: result.error || "Impossible de se connecter avec Google.",
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erreur inattendue",
        text2: "Veuillez réessayer plus tard.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (Platform.OS !== 'ios') {
      Toast.show({
        type: "error",
        text1: "Non disponible",
        text2: "Apple Sign-In n'est disponible que sur iOS.",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithApple();
      
      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Connexion Apple réussie ✅",
          text2: "Bienvenue !",
        });
        await router.replace("/(tabs)");
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur Apple",
          text2: result.error || "Impossible de se connecter avec Apple.",
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erreur inattendue",
        text2: "Veuillez réessayer plus tard.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Toast.show({
        type: "error",
        text1: "Email requis",
        text2: "Veuillez entrer votre email d'abord.",
      });
      return;
    }

    try {
      const result = await resetPassword(email.trim());
      
      if (result.success) {
        Alert.alert(
          "Email envoyé",
          "Un lien de réinitialisation a été envoyé à votre adresse email.",
          [{ text: "OK" }]
        );
      } else {
        Toast.show({
          type: "error",
          text1: "Erreur",
          text2: result.error || "Impossible d'envoyer l'email de réinitialisation.",
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erreur inattendue",
        text2: "Veuillez réessayer plus tard.",
      });
    }
  };

  const handleCallSupport = () => {
    Alert.alert(
      "Support téléphonique",
      "Appeler le support au +33 1 23 45 67 89 ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Appeler", onPress: () => {
          // In a real app, you would use Linking.openURL('tel:+33123456789')
          Toast.show({
            type: "info",
            text1: "Fonctionnalité à venir",
            text2: "L'appel sera implémenté avec Linking.openURL",
          });
        }}
      ]
    );
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

            {/* Mot de passe oublié */}
            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <View style={styles.socialButtonContent}>
                <Image 
                  source={require('@/assets/images/google-login.png')} 
                  style={styles.brandIcon}
                  resizeMode="contain"
                />
                <Text style={styles.socialButtonText}>Se connecter avec Google</Text>
              </View>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                onPress={handleAppleLogin}
                disabled={loading}
              >
                <View style={styles.socialButtonContent}>
                  <Image 
                    source={require('@/assets/images/apple-login.png')} 
                    style={styles.brandIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.socialButtonText}>Se connecter avec Apple</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Call Support Button */}
            <TouchableOpacity
              style={styles.callSupportButton}
              onPress={handleCallSupport}
            >
              <Phone size={16} color="#ff3b3b" />
              <Text style={styles.callSupportText}>Besoin d'aide ? Appeler le support</Text>
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
  forgotPasswordButton: { alignItems: "center", marginTop: 16 },
  forgotPasswordText: { color: "#ff3b3b", fontSize: 14, fontWeight: "500" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#2a2a2a" },
  dividerText: { color: "#666666", fontSize: 14, marginHorizontal: 16 },
  socialButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  socialButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleButton: { backgroundColor: "#1a1a1a" },
  appleButton: { backgroundColor: "#1a1a1a" },
  brandIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  socialButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  callSupportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  callSupportText: { color: "#ff3b3b", fontSize: 14, fontWeight: "500", marginLeft: 8 },
});
