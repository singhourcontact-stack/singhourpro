import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { pickAndUploadProfilePicture, takeAndUploadProfilePicture } from '@/services/profileService';
import { useAuth } from '@/contexts/AuthContext';

interface ProfilePicturePickerProps {
  currentImageUrl?: string;
  onImageUpdated: (newImageUrl: string) => void;
  size?: number;
}

export const ProfilePicturePicker: React.FC<ProfilePicturePickerProps> = ({
  currentImageUrl,
  onImageUpdated,
  size = 120,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleImagePicker = async (source: 'camera' | 'library') => {
    if (!user?.id) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    try {
      setLoading(true);
      
      let newImageUrl: string | null = null;
      
      if (source === 'camera') {
        newImageUrl = await takeAndUploadProfilePicture(user.id);
      } else {
        newImageUrl = await pickAndUploadProfilePicture(user.id);
      }

      if (newImageUrl) {
        onImageUpdated(newImageUrl);
        Alert.alert('Succès', 'Photo de profil mise à jour');
      } else {
        Alert.alert('Erreur', 'Impossible de mettre à jour la photo');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour');
    } finally {
      setLoading(false);
      setShowOptions(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Changer la photo de profil',
      'Comment souhaitez-vous ajouter une photo ?',
      [
        {
          text: 'Appareil photo',
          onPress: () => handleImagePicker('camera'),
        },
        {
          text: 'Galerie',
          onPress: () => handleImagePicker('library'),
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.imageContainer, { width: size, height: size }]}
        onPress={showImageOptions}
        disabled={loading}
      >
        {currentImageUrl ? (
          <Image source={{ uri: currentImageUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholder}>
            <Camera size={size * 0.3} color="#666666" />
          </View>
        )}
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}
        
        <View style={styles.editButton}>
          <Camera size={16} color="#ffffff" />
        </View>
      </TouchableOpacity>
      
      <Text style={styles.helpText}>
        Appuyez pour changer la photo
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: '#ff3b3b',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ff3b3b',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  helpText: {
    color: '#666666',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
