import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Clock, Plus, Trash2, Save } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { saveWorkingHours, getWorkingHours } from '@/utils/workingHoursUtils';
import { WorkingHours } from '@/types/database';

interface WorkingHoursConfigProps {
  visible: boolean;
  onClose: () => void;
}

export const WorkingHoursConfig: React.FC<WorkingHoursConfigProps> = ({
  visible,
  onClose,
}) => {
  const { user } = useAuth();
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [loading, setLoading] = useState(false);

  const dayNames = [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 
    'Jeudi', 'Vendredi', 'Samedi'
  ];

  useEffect(() => {
    if (visible && user) {
      loadWorkingHours();
    }
  }, [visible, user]);

  const loadWorkingHours = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const hours = await getWorkingHours(user.id);
      setWorkingHours(hours);
    } catch (error) {
      console.error('Error loading working hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWorkingHours = (dayOfWeek: number) => {
    const newHours: Omit<WorkingHours, 'id' | 'professional_id' | 'created_at' | 'updated_at'> = {
      day_of_week: dayOfWeek,
      start_time: '09:00',
      end_time: '17:00',
      is_active: true,
    };
    
    setWorkingHours([...workingHours, newHours]);
  };

  const updateWorkingHours = (index: number, field: 'start_time' | 'end_time', value: string) => {
    const updated = [...workingHours];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingHours(updated);
  };

  const removeWorkingHours = (index: number) => {
    const updated = workingHours.filter((_, i) => i !== index);
    setWorkingHours(updated);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const success = await saveWorkingHours(user.id, workingHours);
      
      if (success) {
        Alert.alert('Succès', 'Heures de travail sauvegardées');
        onClose();
      } else {
        Alert.alert('Erreur', 'Impossible de sauvegarder les heures de travail');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getWorkingHoursForDay = (dayOfWeek: number) => {
    return workingHours.filter(wh => wh.day_of_week === dayOfWeek);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Configuration des heures de travail</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {dayNames.map((dayName, dayOfWeek) => {
            const dayHours = getWorkingHoursForDay(dayOfWeek);
            
            return (
              <View key={dayOfWeek} style={styles.daySection}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>{dayName}</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addWorkingHours(dayOfWeek)}
                  >
                    <Plus size={16} color="#ff3b3b" />
                    <Text style={styles.addButtonText}>Ajouter</Text>
                  </TouchableOpacity>
                </View>

                {dayHours.length === 0 ? (
                  <Text style={styles.noHoursText}>Aucune heure définie</Text>
                ) : (
                  dayHours.map((hours, index) => (
                    <View key={index} style={styles.hoursRow}>
                      <View style={styles.timeInputs}>
                        <View style={styles.timeInput}>
                          <Text style={styles.timeLabel}>Début</Text>
                          <Text style={styles.timeValue}>{hours.start_time}</Text>
                        </View>
                        <Text style={styles.separator}>-</Text>
                        <View style={styles.timeInput}>
                          <Text style={styles.timeLabel}>Fin</Text>
                          <Text style={styles.timeValue}>{hours.end_time}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeWorkingHours(
                          workingHours.findIndex(wh => wh === hours)
                        )}
                      >
                        <Trash2 size={16} color="#ff3b3b" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Save size={16} color="#ffffff" />
            <Text style={styles.saveButtonText}>
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#2a2a2a',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    fontSize: 20,
    color: '#666666',
  },
  content: {
    padding: 20,
  },
  daySection: {
    marginBottom: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff3b3b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  noHoursText: {
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  timeInputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    color: '#666666',
    fontSize: 12,
    marginBottom: 4,
  },
  timeValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    color: '#666666',
    fontSize: 16,
    marginHorizontal: 10,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ff3b3b',
  },
  saveButtonDisabled: {
    backgroundColor: '#666666',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
