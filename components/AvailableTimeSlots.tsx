import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getAvailableTimeSlots } from '@/services/bookingService';

interface AvailableTimeSlotsProps {
  professionalId: string;
  date: string;
  onTimeSelect: (time: string) => void;
}

export const AvailableTimeSlots: React.FC<AvailableTimeSlotsProps> = ({
  professionalId,
  date,
  onTimeSelect,
}) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableSlots();
  }, [professionalId, date]);

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      const slots = await getAvailableTimeSlots(professionalId, date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onTimeSelect(time);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement des créneaux disponibles...</Text>
      </View>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noSlotsText}>
          Aucun créneau disponible pour cette date
        </Text>
        <Text style={styles.noSlotsSubtext}>
          Le professionnel n'a pas défini de disponibilités ou a bloqué tous les créneaux
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créneaux disponibles</Text>
      <View style={styles.slotsGrid}>
        {availableSlots.map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeSlot,
              selectedTime === time && styles.selectedTimeSlot
            ]}
            onPress={() => handleTimeSelect(time)}
          >
            <Text style={[
              styles.timeText,
              selectedTime === time && styles.selectedTimeText
            ]}>
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {selectedTime && (
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedInfoText}>
            Créneau sélectionné : {selectedTime}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
  },
  loadingText: {
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noSlotsText: {
    color: '#ff3b3b',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  noSlotsSubtext: {
    color: '#666666',
    textAlign: 'center',
    fontSize: 14,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  selectedTimeSlot: {
    backgroundColor: '#ff3b3b',
    borderColor: '#ff3b3b',
  },
  timeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTimeText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  selectedInfo: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff3b3b',
  },
  selectedInfoText: {
    color: '#ff3b3b',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

