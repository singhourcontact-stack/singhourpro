import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter } from 'lucide-react-native';
import { BookingRequestCard } from '@/components/BookingRequestCard';
import { FilterModal } from '@/components/FilterModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { updateBookingStatus } from '@/services/bookingService';

export default function BookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'pending' | 'confirmed' | 'upcoming' | 'refused'>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    if (user) loadBookings();
  }, [user]);

  const loadBookings = async () => {
    try {
      // Charger les réservations liées à ce pro avec plus de détails
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          date,
          heure,
          status,
          montant,
          created_at,
          updated_at,
          client:profiles!reservations_client_id_fkey (
            prenom, nom, email, telephone
          ),
          service:services (
            titre, description
          )
        `)
        .eq('pro_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;

      // Transformer pour correspondre au format du composant
      const formatted = data?.map((r) => ({
        id: r.id,
        clientName: `${r.client?.prenom || ''} ${r.client?.nom || ''}`.trim(),
        clientEmail: r.client?.email,
        clientPhone: r.client?.telephone,
        service: r.service?.titre || 'Service',
        serviceDescription: r.service?.description,
        date: r.date,
        time: r.heure,
        duration: '1h', // Default duration since column doesn't exist
        price: r.montant,
        status: r.status,
        message: '', // Default empty message since column doesn't exist
        location: 'Non précisé', // Your reservations table doesn't have location column
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        isNew: isNewBooking(r.created_at),
        isUpcoming: isUpcoming(r.date),
      })) || [];

      setBookings(formatted);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
      setBookings([]);
    }
  };

  // Helper function to determine if booking is new (created within last 24h)
  const isNewBooking = (createdAt: string): boolean => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  // Helper function to determine if booking is upcoming
  const isUpcoming = (date: string): boolean => {
    const now = new Date();
    const bookingDate = new Date(date);
    return bookingDate >= now;
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
              const result = await updateBookingStatus(bookingId, 'confirmed');

              if (result.success && result.booking) {
                // Update local state with the updated booking from database
                setBookings(bookings.map((b) =>
                  b.id === bookingId ? { ...b, status: 'confirmed', isNew: false } : b
                ));
                Alert.alert('Succès', 'Réservation acceptée');
                // Reload bookings to ensure consistency with database
                await loadBookings();
              } else {
                throw new Error(result.error || 'Erreur inconnue');
              }
            } catch (error: any) {
              console.error('Error accepting booking:', error);
              Alert.alert('Erreur', error.message || 'Impossible d\'accepter la réservation');
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
              const result = await updateBookingStatus(bookingId, 'refused');

              if (result.success && result.booking) {
                // Update local state with the updated booking from database
                setBookings(bookings.map((b) =>
                  b.id === bookingId ? { ...b, status: 'refused', isNew: false } : b
                ));
                Alert.alert('Succès', 'Réservation refusée');
                // Reload bookings to ensure consistency with database
                await loadBookings();
              } else {
                throw new Error(result.error || 'Erreur inconnue');
              }
            } catch (error: any) {
              console.error('Error refusing booking:', error);
              Alert.alert('Erreur', error.message || 'Impossible de refuser la réservation');
            }
          },
        },
      ]
    );
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'new') return b.isNew;
    if (filter === 'pending') return b.status === 'pending';
    if (filter === 'confirmed') return b.status === 'confirmed';
    if (filter === 'upcoming') return b.isUpcoming && b.status === 'confirmed';
    if (filter === 'refused') return b.status === 'refused';
    return true;
  });

  // Group bookings by status for visual display (when filter is 'all')
  const groupedBookings = filter === 'all' ? {
    new: bookings.filter(b => b.isNew),
    pending: bookings.filter(b => b.status === 'pending' && !b.isNew),
    confirmed: bookings.filter(b => b.status === 'confirmed'),
    upcoming: bookings.filter(b => b.isUpcoming && b.status === 'confirmed'),
    refused: bookings.filter(b => b.status === 'refused'),
  } : null;

  const getStatusCount = (status: string) => {
    if (status === 'all') return bookings.length;
    if (status === 'new') return bookings.filter(b => b.isNew).length;
    if (status === 'upcoming') return bookings.filter(b => b.isUpcoming && b.status === 'confirmed').length;
    return bookings.filter((b) => b.status === status).length;
  };

  const getBookingsByCategory = () => {
    return {
      new: bookings.filter(b => b.isNew),
      pending: bookings.filter(b => b.status === 'pending'),
      confirmed: bookings.filter(b => b.status === 'confirmed'),
      upcoming: bookings.filter(b => b.isUpcoming && b.status === 'confirmed'),
      refused: bookings.filter(b => b.status === 'refused'),
    };
  };

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabsContainer}>
          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterTabText, filter === 'all' && styles.activeFilterTabText]}>
                Toutes ({getStatusCount('all')})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'new' && styles.activeFilterTab]}
              onPress={() => setFilter('new')}
            >
              <Text style={[styles.filterTabText, filter === 'new' && styles.activeFilterTabText]}>
                Nouvelles ({getStatusCount('new')})
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
            <TouchableOpacity
              style={[styles.filterTab, filter === 'upcoming' && styles.activeFilterTab]}
              onPress={() => setFilter('upcoming')}
            >
              <Text style={[styles.filterTabText, filter === 'upcoming' && styles.activeFilterTabText]}>
                À venir ({getStatusCount('upcoming')})
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bookings List */}
        <View style={styles.bookingsList}>
          {filteredBookings.length === 0 ? (
            <Text style={styles.noBookingsText}>
              Aucune réservation dans cette catégorie
            </Text>
          ) : filter === 'all' && groupedBookings ? (
            // Grouped display when showing all bookings
            <View>
              {/* Nouvelles */}
              {groupedBookings.new.length > 0 && (
                <View style={styles.groupSection}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>Nouvelles</Text>
                    <Text style={styles.groupCount}>({groupedBookings.new.length})</Text>
                  </View>
                  {groupedBookings.new.map((b) => (
                    <BookingRequestCard
                      key={b.id}
                      booking={b}
                      onAccept={() => handleAcceptBooking(b.id)}
                      onRefuse={() => handleRefuseBooking(b.id)}
                    />
                  ))}
                </View>
              )}

              {/* En attente */}
              {groupedBookings.pending.length > 0 && (
                <View style={styles.groupSection}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>En attente</Text>
                    <Text style={styles.groupCount}>({groupedBookings.pending.length})</Text>
                  </View>
                  {groupedBookings.pending.map((b) => (
                    <BookingRequestCard
                      key={b.id}
                      booking={b}
                      onAccept={() => handleAcceptBooking(b.id)}
                      onRefuse={() => handleRefuseBooking(b.id)}
                    />
                  ))}
                </View>
              )}

              {/* Confirmées */}
              {groupedBookings.confirmed.length > 0 && (
                <View style={styles.groupSection}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>Confirmées</Text>
                    <Text style={styles.groupCount}>({groupedBookings.confirmed.length})</Text>
                  </View>
                  {groupedBookings.confirmed.map((b) => (
                    <BookingRequestCard
                      key={b.id}
                      booking={b}
                      onAccept={() => handleAcceptBooking(b.id)}
                      onRefuse={() => handleRefuseBooking(b.id)}
                    />
                  ))}
                </View>
              )}

              {/* À venir (upcoming confirmed) */}
              {groupedBookings.upcoming.length > 0 && groupedBookings.upcoming.length !== groupedBookings.confirmed.length && (
                <View style={styles.groupSection}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>À venir</Text>
                    <Text style={styles.groupCount}>({groupedBookings.upcoming.length})</Text>
                  </View>
                  {groupedBookings.upcoming.map((b) => (
                    <BookingRequestCard
                      key={b.id}
                      booking={b}
                      onAccept={() => handleAcceptBooking(b.id)}
                      onRefuse={() => handleRefuseBooking(b.id)}
                    />
                  ))}
                </View>
              )}

              {/* Refusées */}
              {groupedBookings.refused.length > 0 && (
                <View style={styles.groupSection}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>Refusées</Text>
                    <Text style={styles.groupCount}>({groupedBookings.refused.length})</Text>
                  </View>
                  {groupedBookings.refused.map((b) => (
                    <BookingRequestCard
                      key={b.id}
                      booking={b}
                      onAccept={() => handleAcceptBooking(b.id)}
                      onRefuse={() => handleRefuseBooking(b.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            // Flat list when filtering by specific status
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
  filterTabsContainer: { marginBottom: 20 },
  filterTabs: { flexDirection: 'row', paddingHorizontal: 20 },
  filterTab: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#1a1a1a', borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  activeFilterTab: { backgroundColor: '#ff3b3b' },
  filterTabText: { color: '#666666', fontSize: 12, fontWeight: '500' },
  activeFilterTabText: { color: '#ffffff' },
  bookingsList: { paddingHorizontal: 20 },
  noBookingsText: { color: '#666666', textAlign: 'center', fontStyle: 'italic', padding: 40 },
  groupSection: {
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  groupCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
});
