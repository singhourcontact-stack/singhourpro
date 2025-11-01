import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Calendar, Users, Settings } from 'lucide-react-native';
import { List } from 'lucide-react-native';


interface QuickActionsProps {
  onAddOffer: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAddOffer }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actions Rapides</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={onAddOffer}>
          <Plus size={24} color="#ff3b3b" />
          <Text style={styles.actionText}>Ajouter Offre</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/portfolio/add-photo')}>
          <Calendar size={24} color="#ff3b3b" />
          <Text style={styles.actionText}>Ajouter Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/offers/list')}>
          <List size={24} color="#ff3b3b" />
          <Text style={styles.actionText}>Liste des Offres</Text>
       </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/help')}>
          <Settings size={24} color="#ff3b3b" />
          <Text style={styles.actionText}>Aide</Text>
        </TouchableOpacity>
      </View>
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});