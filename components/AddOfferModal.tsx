import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TextInput, 
  ScrollView,
  Image,
  Alert,
  Platform,
  Pressable
} from 'react-native';
import { X, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext'; // ✅ pour récupérer le user connecté

interface AddOfferModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddOfferModal: React.FC<AddOfferModalProps> = ({ visible, onClose }) => {
  const { user } = useAuth(); // ✅ Récupération de l’utilisateur (professional)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title || !description || !price) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non authentifié');
      return;
    }

    try {
      // ✅ Insertion dans Supabase
      const { error } = await supabase.from('offers').insert([
        {
          professional_id: user.id,
          title,
          description,
          price: parseFloat(price),
          images,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      Alert.alert('Succès', 'Offre ajoutée avec succès');
      onClose();

      // ✅ Reset du formulaire
      setTitle('');
      setDescription('');
      setPrice('');
      setImages([]);
    } catch (error) {
      console.error('Erreur insertion offre:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'offre');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Ajouter une Offre</Text>
          <Pressable onPress={onClose}>
            <X size={24} color="#ffffff" />
          </Pressable>
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
            <Pressable style={styles.imagePickerButton} onPress={pickImage}>
              <Camera size={24} color="#ff3b3b" />
              <Text style={styles.imagePickerText}>Ajouter des photos</Text>
            </Pressable>

            {images.length > 0 && (
              <View style={styles.imagesGrid}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.image} />
                    <Pressable 
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <X size={16} color="#ffffff" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </Pressable>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Publier l'offre</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// 🔥 Styles inchangés
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  form: { flex: 1, padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#ffffff', marginBottom: 8 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#ffffff', borderWidth: 1, borderColor: '#2a2a2a' },
  textArea: { height: 100, ...(Platform.OS === 'android' ? { textAlignVertical: 'top' } : { verticalAlign: 'top' }) },
  imagePickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a', borderRadius: 8, paddingVertical: 20, borderWidth: 2, borderColor: '#ff3b3b', borderStyle: 'dashed' },
  imagePickerText: { color: '#ff3b3b', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  imageContainer: { position: 'relative' },
  image: { width: 80, height: 80, borderRadius: 8 },
  removeImageButton: { position: 'absolute', top: -8, right: -8, backgroundColor: '#ff3b3b', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  footer: { flexDirection: 'row', padding: 20, gap: 12 },
  cancelButton: { flex: 1, paddingVertical: 16, borderRadius: 8, backgroundColor: '#1a1a1a', alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  cancelButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  saveButton: { flex: 1, paddingVertical: 16, borderRadius: 8, backgroundColor: '#ff3b3b', alignItems: 'center' },
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
