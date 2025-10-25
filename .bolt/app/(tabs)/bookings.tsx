import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter, Search } from 'lucide-react-native';
import { BookingRequestCard } from '@/components/BookingRequestCard';
import { FilterModal } from '@/components/FilterModal';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, refused
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      // Simulation des données - remplacer par Supabase
      const mockBookings = [
        {
          id: 1,
          clientName: 'Marie Dubois',
          clientEmail: 'marie.dubois@email.com',
          clientPhone: '+33 6 12 34 56 78',
          service: 'Shooting Portrait',
          date: '2025-01-20',
          time: '14:00',
          duration: '2h',
          price: 250,
          status: 'pending',
          message: 'Bonjour, je souhaiterais un shooting portrait professionnel pour mon LinkedIn.',
          location: 'Paris 15ème',
        },
        {
          id: 2,
          clientName: 'Jean Martin',
          clientEmail: 'j.martin@email.com',
          clientPhone: '+33 6 87 65 43 21',
          service: 'Vidéo Mariage',
          date: '2025-02-14',
          time: '10:00',
          duration: '8h',
          price: 1200,
          status: 'confirmed',
          message: 'Mariage le 14 février, nous recherchons un vidéaste expérimenté.',
          location: 'Château de Versailles',
        },
        {
          id: 3,
          clientName: 'Sophie Laurent',
          clientEmail: 'sophie.l@email.com',
          clientPhone: '+33 6 23 45 67 89',
          service: 'Shooting Produit',
          date: '2025-01-18',
          time: '09:00',
          duration: '4h',
          price: 400,
          status: 'pending',
          message: 'Je souhaite faire photographier mes créations artisanales pour mon site e-commerce.',
          location: 'Studio client',
        },
      ];
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    Alert.alert(
      'Accepter la réservation',
      'Voulez-vous confirmer cette réservation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: async () => {
            try {
              // Mettre à jour en base de données
              setBookings(bookings.map(booking => 
                booking.id === bookingId 
                  ? { ...booking, status: 'confirmed' }
                  : booking
              ));
              Alert.alert('Succès', 'Réservation acceptée');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'accepter la réservation');
            }
          },
        },
      ]
    );
  };

  const handleRefuseBooking = async (bookingId) => {
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
              // Mettre à jour en base de données
              setBookings(bookings.map(booking => 
                booking.id === bookingId 
                  ? { ...booking, status: 'refused' }
                  : booking
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

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusCount = (status) => {
    return bookings.filter(booking => booking.status === status).length;
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
            filteredBookings.map((booking) => (
              <BookingRequestCard
                key={booking.id}
                booking={booking}
                onAccept={() => handleAcceptBooking(booking.id)}
                onRefuse={() => handleRefuseBooking(booking.id)}
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
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  filterButton: {
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#ff3b3b',
  },
  filterTabText: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#ffffff',
  },
  bookingsList: {
    paddingHorizontal: 20,
  },
  noBookingsText: {
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 40,
  },
});