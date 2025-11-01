import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MapPin, ChevronRight } from 'lucide-react-native';

export const RecentBookings: React.FC = () => {
  const recentBookings = [
    {
      id: 1,
      clientName: 'Marie Dubois',
      service: 'Shooting Portrait',
      date: 'Aujourd\'hui',
      time: '14:00',
      location: 'Paris 15ème',
      status: 'confirmed',
    },
    {
      id: 2,
      clientName: 'Jean Martin',
      service: 'Vidéo Mariage',
      date: 'Demain',
      time: '10:00',
      location: 'Versailles',
      status: 'pending',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#00C851';
      case 'pending':
        return '#ffbb33';
      default:
        return '#666666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      default:
        return 'Inconnu';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prochaines Réservations</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bookingsList}>
        {recentBookings.map((booking) => (
          <TouchableOpacity key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingInfo}>
              <Text style={styles.clientName}>{booking.clientName}</Text>
              <Text style={styles.serviceName}>{booking.service}</Text>
              
              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Clock size={14} color="#666666" />
                  <Text style={styles.detailText}>{booking.date} à {booking.time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MapPin size={14} color="#666666" />
                  <Text style={styles.detailText}>{booking.location}</Text>
                </View>
              </View>

              <View style={styles.statusContainer}>
                <View 
                  style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(booking.status) + '20' }
                  ]}
                >
                  <Text 
                    style={[
                      styles.statusText, 
                      { color: getStatusColor(booking.status) }
                    ]}
                  >
                    {getStatusText(booking.status)}
                  </Text>
                </View>
              </View>
            </View>

            <ChevronRight size={16} color="#666666" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  seeAllText: {
    color: '#ff3b3b',
    fontSize: 14,
    fontWeight: '500',
  },
  bookingsList: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  bookingInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
  },
  bookingDetails: {
    gap: 4,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#666666',
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});