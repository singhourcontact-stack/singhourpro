import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react-native';
import { CalendarGrid } from '@/components/CalendarGrid';
import { BookingCard } from '@/components/BookingCard';

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      // Simulation des données - remplacer par Supabase
      const mockBookings = [
        {
          id: 1,
          date: new Date().toISOString(),
          clientName: 'Marie Dubois',
          service: 'Shooting Portrait',
          time: '14:00',
          status: 'confirmed',
        },
        {
          id: 2,
          date: new Date(Date.now() + 86400000).toISOString(),
          clientName: 'Jean Martin',
          service: 'Vidéo Mariage',
          time: '10:00',
          status: 'pending',
        },
      ];
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const blockDate = () => {
    Alert.alert(
      'Bloquer cette date',
      'Voulez-vous rendre cette date indisponible ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Bloquer',
          onPress: () => {
            setBlockedDates([...blockedDates, selectedDate.toISOString()]);
            Alert.alert('Succès', 'Date bloquée avec succès');
          },
        },
      ]
    );
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const selectedDateBookings = bookings.filter(booking => 
    new Date(booking.date).toDateString() === selectedDate.toDateString()
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendrier</Text>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => navigateMonth(-1)}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <Text style={styles.monthText}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => navigateMonth(1)}
          >
            <ChevronRight size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <CalendarGrid
          currentDate={currentDate}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          bookings={bookings}
          blockedDates={blockedDates}
        />

        {/* Selected Date Actions */}
        <View style={styles.dateActions}>
          <Text style={styles.selectedDateText}>
            {selectedDate.toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          
          <TouchableOpacity style={styles.blockButton} onPress={blockDate}>
            <X size={16} color="#ffffff" />
            <Text style={styles.blockButtonText}>Bloquer cette date</Text>
          </TouchableOpacity>
        </View>

        {/* Bookings for Selected Date */}
        <View style={styles.bookingsSection}>
          <Text style={styles.sectionTitle}>Réservations du jour</Text>
          {selectedDateBookings.length === 0 ? (
            <Text style={styles.noBookingsText}>Aucune réservation ce jour</Text>
          ) : (
            selectedDateBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </View>
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
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  navButton: {
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  dateActions: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    margin: 20,
    borderRadius: 12,
  },
  selectedDateText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 15,
    textTransform: 'capitalize',
  },
  blockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff3b3b',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  blockButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  bookingsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
  },
  noBookingsText: {
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
});