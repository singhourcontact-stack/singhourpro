import { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function IndexScreen() {
  const router = useRouter();
  const { user, profile, loading, initialized } = useAuth();

  useEffect(() => {
    console.log("IndexScreen ▶ useEffect start", {
      timestamp: new Date().toISOString(),
      user: !!user,
      profile,
      loading,
      initialized,
    });

    // Si pas initialisé => attendre (trace pour debug)
    if (!initialized) {
      console.log("IndexScreen ▶ waiting for initialization...");
      return;
    }

    // Procéder seulement après initialisation
    (async () => {
      try {
        console.log("IndexScreen ▶ initialization done, evaluating route...");
        // trace d'état juste avant décision
        console.log("IndexScreen ▶ state", { user: !!user, profile, loading });

        if (!loading) {
          if (!user) {
            console.log("IndexScreen ▶ redirect -> /login");
            await router.replace("/login");
            console.log("IndexScreen ▶ router.replace('/login') called");
          } else if (!profile) {
            console.log("IndexScreen ▶ user present but no profile -> redirect -> /(tabs)");
            await router.replace("/(tabs)");
            console.log("IndexScreen ▶ router.replace('/(tabs)') called (profile setup)");
          } else {
            console.log("IndexScreen ▶ user + profile -> redirect -> /(tabs)");
            await router.replace("/(tabs)");
            console.log("IndexScreen ▶ router.replace('/(tabs)') called (main tabs)");
          }
        } else {
          console.log("IndexScreen ▶ still loading data, staying on splash");
        }
      } catch (err) {
        console.error("IndexScreen ▶ error during routing decision", err);
      } finally {
        console.log("IndexScreen ▶ useEffect end", { timestamp: new Date().toISOString() });
      }
    })();
  }, [user, profile, loading, initialized, router]);

  // Écran de splash/chargement
  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>SINGHOUR'S</Text>
      <Text style={styles.subtitle}>
        {!initialized
          ? "Initialisation..."
          : loading
          ? "Chargement..."
          : "Redirection..."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ff3b3b",
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
});
