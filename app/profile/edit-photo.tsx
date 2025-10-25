import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function EditPhotoScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'L\'accès à la caméra est nécessaire pour prendre une photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const removePhoto = () => {
    Alert.alert(
      'Supprimer la photo',
      'Êtes-vous sûr de vouloir supprimer votre photo de profil ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => setProfileImage(null),
        },
      ]
    );
  };

  const savePhoto = async () => {
    setLoading(true);
    
    try {
      // Simulation de l'upload (remplacer par Supabase Storage plus tard)
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'Photo mise à jour',
          'Votre photo de profil a été mise à jour avec succès.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo de profil.');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Choisir une photo',
      'Comment souhaitez-vous ajouter votre photo ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Galerie', onPress: pickImageFromLibrary },
        { text: 'Appareil photo', onPress: takePhoto },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Photo de profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Current Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Camera size={60} color="#666666" />
              </View>
            )}
          </View>

          <Text style={styles.photoHint}>
            Choisissez une photo qui vous représente bien
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={showImagePicker}>
            <ImageIcon size={20} color="#ff3b3b" />
            <Text style={styles.actionButtonText}>
              {profileImage ? 'Changer la photo' : 'Ajouter une photo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Camera size={20} color="#ff3b3b" />
            <Text style={styles.actionButtonText}>Prendre une photo</Text>
          </TouchableOpacity>

          {profileImage && (
            <TouchableOpacity style={styles.removeButton} onPress={removePhoto}>
              <Trash2 size={20} color="#ff3b3b" />
              <Text style={styles.removeButtonText}>Supprimer la photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Save Button */}
        {profileImage && (
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={savePhoto}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Conseils pour une bonne photo :</Text>
          <Text style={styles.tipText}>• Utilisez un éclairage naturel</Text>
          <Text style={styles.tipText}>• Regardez directement l'objectif</Text>
          <Text style={styles.tipText}>• Évitez les photos floues</Text>
          <Text style={styles.tipText}>• Choisissez un arrière-plan neutre</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  photoContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#ff3b3b',
  },
  placeholderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: '#ff3b3b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoHint: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  actionButtons: {
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff3b3b',
  },
  removeButtonText: {
    color: '#ff3b3b',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  saveButton: {
    backgroundColor: '#ff3b3b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 6,
  },
});