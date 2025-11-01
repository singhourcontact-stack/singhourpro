import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { X } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabase';
import { updateProfile } from '@/services/dataService';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: any;
  onSave: (profile: any) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  visible, 
  onClose, 
  profile, 
  onSave 
}) => {
  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [address, setAddress] = useState(profile.adresse || '');
  const [bio, setBio] = useState(profile.societe || '');
  const [type, setType] = useState(profile.type || 'studio');
  const [isOnline, setIsOnline] = useState(profile.is_online || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !email || !phone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSaving(true);
      
      const result = await updateProfile(profile.id, {
        prenom: name.split(' ')[0],
        nom: name.split(' ').slice(1).join(' '),
        email,
        telephone: phone,
        adresse: address,
        societe: bio,
        // Note: is_online column doesn't exist in your database
      });

      if (result.success) {
        // Update the profile with the actual data from the database
        const updatedProfileData = {
          ...profile,
          prenom: name.split(' ')[0],
          nom: name.split(' ').slice(1).join(' '),
          email,
          telephone: phone,
          adresse: address,
          societe: bio,
        };
        onSave(updatedProfileData);
        onClose();
        Alert.alert('Succès', 'Profil mis à jour avec succès');
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de mettre à jour le profil');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Modifier le Profil</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Nom */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du studio / service *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Studio SINGHOUR'S"
              placeholderTextColor="#666666"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="contact@singhours.com"
              placeholderTextColor="#666666"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Téléphone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+33 6 12 34 56 78"
              placeholderTextColor="#666666"
              keyboardType="phone-pad"
            />
          </View>

          {/* Adresse */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="123 Rue de la Photographie, 75001 Paris"
              placeholderTextColor="#666666"
            />
          </View>

          {/* Société/Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Société / Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Décrivez vos services et votre expérience..."
              placeholderTextColor="#666666"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Type de professionnel */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type de professionnel</Text>
            <View style={{ backgroundColor: '#1a1a1a', borderRadius: 8 }}>
              <Picker
                selectedValue={type}
                dropdownIconColor="#fff"
                style={{ color: '#fff' }}
                onValueChange={(itemValue) => setType(itemValue)}
              >
                <Picker.Item label="Studio" value="studio" />
                <Picker.Item label="Photographe" value="photographe" />
                <Picker.Item label="Réalisateur vidéo" value="realisateur" />
              </Picker>
            </View>
          </View>

          {/* Disponibilité */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Disponibilité</Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: '#666', true: '#ff3b3b' }}
              thumbColor={isOnline ? '#fff' : '#888'}
            />
            <Text style={{ color: '#fff', marginTop: 5 }}>
              {isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

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
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
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
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#ff3b3b',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.7,
  },
});
