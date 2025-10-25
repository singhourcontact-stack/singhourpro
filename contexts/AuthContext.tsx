import React, { createContext, useContext, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as importedSupabase } from "../lib/supabase";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from "react-native";
import { X, Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

// Type definitions
type UserObj = { id: string; email?: string } | null;
type Profile = any | null;
type SignInResult = { user: UserObj; error?: any };
type SignUpResult = { user: UserObj; error?: any };

interface AuthContextValue {
  user: UserObj;
  profile: Profile;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, prenom: string, nom: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}

/* -------------------------
   Helper: fetchWithTimeout
   - AbortController pour annuler après timeout
   - parse JSON seulement si content-type le permet
   ------------------------- */
async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeout = 7000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function parseResponseSafe(res: Response) {
  const ct = res.headers.get?.("content-type") ?? "";
  try {
    if (ct.includes("application/json")) return await res.json();
    return await res.text();
  } catch (err) {
    // fallback si parsing échoue
    return `<<unparseable response, status=${res.status}>>`;
  }
}

/* -------------------------
   AddOfferModal (inchangé fonctionnel)
   ------------------------- */

interface AddOfferModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddOfferModal: React.FC<AddOfferModalProps> = ({ visible, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map((asset) => asset.uri)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title || !description || !price) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      Alert.alert("Succès", "Offre ajoutée avec succès");
      onClose();
      setTitle("");
      setDescription("");
      setPrice("");
      setImages([]);
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'ajouter l'offre");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Ajouter une Offre</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre de l'offre</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Shooting Portrait Professionnel"
              placeholderTextColor="#666666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez votre service en détail..."
              placeholderTextColor="#666666"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix (€)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="250"
              placeholderTextColor="#666666"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Photos</Text>
            <TouchableOpacity
              style={[styles.imagePickerButton, styles.shadow]}
              onPress={pickImage}
            >
              <Camera size={24} color="#ff3b3b" />
              <Text style={styles.imagePickerText}>Ajouter des photos</Text>
            </TouchableOpacity>

            {images.length > 0 && (
              <View style={styles.imagesGrid}>
                {images.map((uri, index) => (
                  <View key={index} style={[styles.imageContainer, styles.shadow]}>
                    <Image source={{ uri }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <X size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Publier l'offre</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/* -------------------------
   Auth context + provider
   - expose user, profile, loading, initialized, signIn, signOut
   ------------------------- */

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserObj>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  const clientFromLib: SupabaseClient | null = (() => {
    try {
      return (importedSupabase as SupabaseClient) ?? null;
    } catch {
      return null;
    }
  })();

  if (!clientFromLib) {
    console.warn(
      "AuthProvider ▶ Supabase client not available from lib. Vérifiez lib/supabase.ts et app.json.extra (supabaseUrl / supabaseAnonKey) ou vos variables d'environnement."
    );
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (!clientFromLib) {
          console.warn("AuthProvider ▶ Supabase client not available, skipping init.");
          return;
        }
        const { data, error } = await clientFromLib.auth.getSession();
        if (error) {
          console.warn("AuthProvider ▶ getSession warning", error);
        }
        const supaUser = data?.session?.user ?? null;
        if (mounted) setUser(supaUser ? { id: supaUser.id, email: supaUser.email ?? undefined } : null);

        if (supaUser) {
          const { data: profileData, error: profileError } = await clientFromLib
            .from("profiles")
            .select("*")
            .eq("id", supaUser.id)
            .limit(1)
            .single();
          if (profileError) console.warn("AuthProvider ▶ profile fetch warning", profileError);
          if (mounted) setProfile(profileData ?? null);
        }
      } catch (err) {
        console.error("AuthProvider ▶ init error", err);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [clientFromLib]);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    setLoading(true);
    try {
      if (!clientFromLib) {
        const err = new Error("Supabase client not configured (SUPABASE_ANON_KEY missing)");
        console.error("AuthProvider ▶ signIn aborted:", err);
        return { user: null, error: err };
      }
      const res = await clientFromLib.auth.signInWithPassword({ email, password });
      if (res.error) {
        console.error("AuthProvider ▶ signIn error", res.error);
        return { user: null, error: res.error };
      }
      const supaUser = res.data?.user ?? null;
      const userObj = supaUser ? { id: supaUser.id, email: supaUser.email ?? undefined } : null;
      setUser(userObj);
      return { user: userObj };
    } catch (err) {
      console.error("AuthProvider ▶ signIn unexpected error", err);
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, prenom: string, nom: string): Promise<SignUpResult> => {
    setLoading(true);
    try {
      if (!clientFromLib) {
        const err = new Error("Supabase client not configured (SUPABASE_ANON_KEY missing)");
        console.error("AuthProvider ▶ signUp aborted:", err);
        return { user: null, error: err };
      }
      
      // Sign up the user
      const res = await clientFromLib.auth.signUp({ email, password });
      if (res.error) {
        console.error("AuthProvider ▶ signUp error", res.error);
        return { user: null, error: res.error };
      }
      
      const supaUser = res.data?.user ?? null;
      const userObj = supaUser ? { id: supaUser.id, email: supaUser.email ?? undefined } : null;
      
      // Create profile in the database
      if (supaUser) {
        const { error: profileError } = await clientFromLib
          .from("profiles")
          .insert({
            id: supaUser.id,
            prenom: prenom,
            nom: nom,
            email: email,
            role: 'client' // Default role
          });
        
        if (profileError) {
          console.error("AuthProvider ▶ profile creation error", profileError);
          return { user: userObj, error: profileError };
        }
      }
      
      setUser(userObj);
      return { user: userObj };
    } catch (err) {
      console.error("AuthProvider ▶ signUp unexpected error", err);
      return { user: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (clientFromLib) await clientFromLib.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("AuthProvider ▶ signOut error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        initialized,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

/* -------------------------
   Styles (inchangés, coupés si trop longs)
   ------------------------- */

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
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  textArea: {
    height: 100,
    ...(Platform.OS === "android"
      ? { textAlignVertical: "top" }
      : { verticalAlign: "top" }),
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: "#ff3b3b",
    borderStyle: "dashed",
  },
  imagePickerText: {
    color: "#ff3b3b",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  imageContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff3b3b",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#ff3b3b",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  shadow: Platform.select({
    ios: {
      boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
    },
    web: {
      boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
    },
    android: {
      elevation: 6,
    },
  }),
});
