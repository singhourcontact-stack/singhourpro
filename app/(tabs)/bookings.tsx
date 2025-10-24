import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter } from 'lucide-react-native';
import { BookingRequestCard } from '@/components/BookingRequestCard';
import { FilterModal } from '@/components/FilterModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function BookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'refused'>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    if (user) loadBookings();
  }, [user]);

  const loadBookings = async () => {
    try {
      // Charger les réservations liées à ce pro
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          date,
          heure,
          status,
          montant,
          service_id,
          client:profiles!reservations_client_id_fkey (
            prenom, nom, email, telephone
          ),
          service:services (
            titre
          )
        `)
        .eq('pro_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;

      // Transformer pour correspondre au format du composant
      const formatted = data.map((r) => ({
        id: r.id,
        clientName: `${r.client?.prenom} ${r.client?.nom}`,
        clientEmail: r.client?.email,
        clientPhone: r.client?.telephone,
        service: r.service?.titre,
        date: r.date,
        time: r.heure,
        price: r.montant,
        status: r.status,
        message: r.message || '',
        location: r.location || 'Non précisé',
      }));

      setBookings(formatted);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    Alert.alert(
      'Accepter la réservation',
      'Voulez-vous confirmer cette réservation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('reservations')
                .update({ status: 'confirmed' })
                .eq('id', bookingId);

              if (error) throw error;

              setBookings(bookings.map((b) =>
                b.id === bookingId ? { ...b, status: 'confirmed' } : b
              ));
              Alert.alert('Succès', 'Réservation acceptée');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d’accepter la réservation');
            }
          },
        },
      ]
    );
  };

  const handleRefuseBooking = async (bookingId: string) => {
    Alert.alert(
      'Refuser la réservation',
      'Voulez-vous refuser cette réservation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('reservations')
                .update({ status: 'refused' })
                .eq('id', bookingId);

              if (error) throw error;

              setBookings(bookings.map((b) =>
                b.id === bookingId ? { ...b, status: 'refused' } : b
              ));
              Alert.alert('Succès', 'Réservation refusée');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de refuser la réservation');
            }
          },
        },
      ]
    );
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const getStatusCount = (status: string) =>
    bookings.filter((b) => b.status === status).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Réservations</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.activeFilterTabText]}>
              Toutes ({bookings.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'pending' && styles.activeFilterTab]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterTabText, filter === 'pending' && styles.activeFilterTabText]}>
              En attente ({getStatusCount('pending')})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'confirmed' && styles.activeFilterTab]}
            onPress={() => setFilter('confirmed')}
          >
            <Text style={[styles.filterTabText, filter === 'confirmed' && styles.activeFilterTabText]}>
              Confirmées ({getStatusCount('confirmed')})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bookings List */}
        <View style={styles.bookingsList}>
          {filteredBookings.length === 0 ? (
            <Text style={styles.noBookingsText}>
              Aucune réservation dans cette catégorie
            </Text>
          ) : (
            filteredBookings.map((b) => (
              <BookingRequestCard
                key={b.id}
                booking={b}
                onAccept={() => handleAcceptBooking(b.id)}
                onRefuse={() => handleRefuseBooking(b.id)}
              />
            ))
          )}
        </View>

        {/* Filter Modal */}
        <FilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          currentFilter={filter}
          onFilterChange={setFilter}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  filterButton: { padding: 8, backgroundColor: '#1a1a1a', borderRadius: 8 },
  filterTabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  filterTab: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#1a1a1a', borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  activeFilterTab: { backgroundColor: '#ff3b3b' },
  filterTabText: { color: '#666666', fontSize: 12, fontWeight: '500' },
  activeFilterTabText: { color: '#ffffff' },
  bookingsList: { paddingHorizontal: 20 },
  noBookingsText: { color: '#666666', textAlign: 'center', fontStyle: 'italic', padding: 40 },
});
