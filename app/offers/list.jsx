import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react-native';

export default function OffersListScreen() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) loadOffers();
  }, [user]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des offres:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#ff3b3b" />
        </TouchableOpacity>
        <Text style={styles.title}>Liste des Offres</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#ff3b3b" size="large" />
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          {offers.length === 0 ? (
            <Text style={styles.emptyText}>Aucune offre trouvée.</Text>
          ) : (
            offers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                {/* Image */}
                {offer.images && Array.isArray(offer.images) && offer.images.length > 0 ? (
                  <Image source={{ uri: offer.images[0] }} style={styles.offerImage} />
                ) : null}

                {/* Titre */}
                <Text style={styles.offerTitle}>{offer.title}</Text>

                {/* Catégorie + durée */}
                <View style={styles.metaContainer}>
                  {offer.category && <Text style={styles.metaText}>📂 {offer.category}</Text>}
                  {offer.duration && <Text style={styles.metaText}>⏱ {offer.duration}</Text>}
                </View>

                {/* Description */}
                {offer.description ? (
                  <Text style={styles.offerDesc}>{offer.description}</Text>
                ) : null}

                {/* Prix */}
                {offer.price !== null && (
                  <Text style={styles.offerPrice}>{offer.price} €</Text>
                )}

                {/* Statut */}
                <Text
                  style={[
                    styles.status,
                    { color: offer.is_active ? '#4CAF50' : '#ff3b3b' },
                  ]}
                >
                  {offer.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff3b3b',
  },
  scroll: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  offerCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  offerImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  offerDesc: {
    fontSize: 14,
    color: '#ccc',
    marginVertical: 5,
  },
  offerPrice: {
    fontSize: 16,
    color: '#ff3b3b',
    fontWeight: '600',
    marginTop: 5,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  metaText: {
    fontSize: 13,
    color: '#bbb',
  },
  status: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});
