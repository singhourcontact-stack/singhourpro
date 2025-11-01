import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MapPin, Search, Check } from 'lucide-react-native';
import { updateProfile } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';

interface LocationPickerProps {
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  onLocationUpdated: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  currentLocation,
  onLocationUpdated,
}) => {
  const { user } = useAuth();
  const [address, setAddress] = useState(currentLocation?.address || '');
  const [loading, setLoading] = useState(false);

  const handleSaveLocation = async () => {
    if (!user?.id) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une adresse');
      return;
    }

    try {
      setLoading(true);
      
      // In a real implementation, you would use Google Maps Geocoding API
      // to convert address to coordinates. For now, we'll use mock coordinates.
      const mockLocation = {
        latitude: 48.8566 + (Math.random() - 0.5) * 0.01, // Paris area
        longitude: 2.3522 + (Math.random() - 0.5) * 0.01,
        address: address.trim(),
      };

      const result = await updateProfile(user.id, {
        location: mockLocation
      });
      
      if (result.success) {
        onLocationUpdated(mockLocation);
        Alert.alert('Succès', 'Localisation mise à jour');
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de sauvegarder la localisation');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      // In a real implementation, you would use expo-location
      // to get the user's current location
      Alert.alert(
        'Localisation actuelle',
        'Cette fonctionnalité nécessite l\'intégration d\'expo-location. Pour l\'instant, veuillez saisir votre adresse manuellement.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'obtenir votre localisation');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MapPin size={20} color="#ff3b3b" />
        <Text style={styles.title}>Localisation</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Saisissez votre adresse complète"
          placeholderTextColor="#666666"
          multiline
        />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleGetCurrentLocation}
        >
          <Search size={16} color="#ff3b3b" />
          <Text style={styles.currentLocationText}>Localisation actuelle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveLocation}
          disabled={loading}
        >
          <Check size={16} color="#ffffff" />
          <Text style={styles.saveButtonText}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Text>
        </TouchableOpacity>
      </View>

      {currentLocation && (
        <View style={styles.currentLocationInfo}>
          <Text style={styles.currentLocationLabel}>Localisation actuelle :</Text>
          <Text style={styles.currentLocationAddress}>{currentLocation.address}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  currentLocationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ff3b3b',
  },
  currentLocationText: {
    color: '#ff3b3b',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b3b',
    borderRadius: 8,
    padding: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#666666',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  currentLocationInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  currentLocationLabel: {
    color: '#666666',
    fontSize: 12,
    marginBottom: 4,
  },
  currentLocationAddress: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});
