import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { deletePortfolioItem } from '@/services/portfolioService';

interface PortfolioItemUI {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
}

interface PortfolioGridProps {
  portfolio: Array<PortfolioItemUI>;
  onDeleted?: (id: string) => void;
}

const screenWidth = Dimensions.get('window').width;
const imageSize = (screenWidth - 60) / 3; // 3 columns with padding

export const PortfolioGrid: React.FC<PortfolioGridProps> = ({ portfolio, onDeleted }) => {
  const router = useRouter();

  return (
    <View style={styles.grid}>
      {portfolio.map((item) => {
        const handleDelete = () => {
          Alert.alert(
            'Supprimer',
            'Voulez-vous supprimer cette photo du portfolio ?',
            [
              { text: 'Annuler', style: 'cancel' },
              {
                text: 'Supprimer',
                style: 'destructive',
                onPress: async () => {
                  const ok = await deletePortfolioItem(item.id);
                  if (ok) onDeleted?.(item.id);
                },
              },
            ]
          );
        };

        return (
          <View key={item.id} style={styles.imageContainer}>
            <Image source={{ uri: item.media_url }} style={styles.image} />
            <TouchableOpacity style={styles.removeButton} onPress={handleDelete}>
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        );
      })}
      <TouchableOpacity 
        style={[styles.imageContainer, styles.addButton]} 
        onPress={() => router.push('/portfolio/add-photo')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#ff3b3b',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 32,
    color: '#ff3b3b',
    fontWeight: '300',
  },
});