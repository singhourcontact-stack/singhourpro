import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createBooking } from '@/services/bookingService';
import { isTimeSlotBlocked } from '@/utils/blockingUtils';

interface BlockingDemoProps {
  professionalId: string;
  clientId: string;
}

export const BlockingDemo: React.FC<BlockingDemoProps> = ({
  professionalId,
  clientId,
}) => {
  const [selectedDate, setSelectedDate] = useState('2025-01-20');
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [isChecking, setIsChecking] = useState(false);

  const handleBookingAttempt = async () => {
    try {
      setIsChecking(true);
      
      // First check if the slot is blocked
      const isBlocked = await isTimeSlotBlocked(professionalId, selectedDate, selectedTime);
      
      if (isBlocked) {
        Alert.alert(
          'Créneau bloqué',
          'Ce créneau est bloqué par le professionnel et ne peut pas être réservé.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Try to create the booking
      const result = await createBooking({
        client_id: clientId,
        professional_id: professionalId,
        offer_id: 'demo-offer-id',
        date: selectedDate,
        time: selectedTime,
        duration: '1h',
        location: 'Paris',
        message: 'Réservation de démonstration',
        price: 100,
      });

      if (result.success) {
        Alert.alert(
          'Réservation créée',
          'Votre réservation a été créée avec succès !',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Erreur',
          result.error || 'Impossible de créer la réservation',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la vérification',
        [{ text: 'OK' }]
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Démonstration du système de blocage</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Ce composant démontre comment le système empêche les réservations sur des créneaux bloqués.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.input}>{selectedDate}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Heure</Text>
          <Text style={styles.input}>{selectedTime}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isChecking && styles.buttonDisabled]}
          onPress={handleBookingAttempt}
          disabled={isChecking}
        >
          <Text style={styles.buttonText}>
            {isChecking ? 'Vérification...' : 'Tenter une réservation'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.explanation}>
        <Text style={styles.explanationTitle}>Comment ça marche :</Text>
        <Text style={styles.explanationText}>
          1. Le système vérifie d'abord si le créneau est bloqué{'\n'}
          2. Si bloqué : affiche un message d'erreur{'\n'}
          3. Si disponible : tente de créer la réservation{'\n'}
          4. Vérifie aussi les conflits avec d'autres réservations
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  infoText: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  button: {
    backgroundColor: '#ff3b3b',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#666666',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  explanation: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  explanationTitle: {
    color: '#ff3b3b',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  explanationText: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },
});

