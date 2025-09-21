import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { X, Check } from 'lucide-react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ 
  visible, 
  onClose, 
  currentFilter, 
  onFilterChange 
}) => {
  const filters = [
    { key: 'all', label: 'Toutes les réservations' },
    { key: 'pending', label: 'En attente' },
    { key: 'confirmed', label: 'Confirmées' },
    { key: 'refused', label: 'Refusées' },
  ];

  const handleFilterSelect = (filterKey: string) => {
    onFilterChange(filterKey);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Filtrer par statut</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterList}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={styles.filterItem}
                onPress={() => handleFilterSelect(filter.key)}
              >
                <Text style={styles.filterLabel}>{filter.label}</Text>
                {currentFilter === filter.key && (
                  <Check size={20} color="#ff3b3b" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
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
    fontWeight: '600',
    color: '#ffffff',
  },
  filterList: {
    paddingTop: 20,
  },
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
});