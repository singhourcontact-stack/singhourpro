import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions, Text } from 'react-native';
import { useRouter } from 'expo-router';

interface PortfolioGridProps {
  portfolio: Array<{
    id: number;
    url: string;
    type: 'image' | 'video';
  }>;
}

const screenWidth = Dimensions.get('window').width;
const imageSize = (screenWidth - 60) / 3; // 3 columns with padding

export const PortfolioGrid: React.FC<PortfolioGridProps> = ({ portfolio }) => {
  const router = useRouter();

  return (
    <View style={styles.grid}>
      {portfolio.map((item) => (
        <TouchableOpacity key={item.id} style={styles.imageContainer}>
          <Image source={{ uri: item.url }} style={styles.image} />
        </TouchableOpacity>
      ))}
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
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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