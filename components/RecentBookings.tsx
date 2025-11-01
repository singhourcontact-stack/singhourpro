import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MapPin, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const RecentBookings: React.FC = () => {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentBookings();
    }
  }, [user]);

  const loadRecentBookings = async () => {
    try {
      setLoading(true);
      
      // Get upcoming bookings (today and future dates)
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          date,
          heure,
          status,
          client:profiles!reservations_client_id_fkey (
            prenom, nom
          ),
          service:services (
            titre
          )
        `)
        .eq('pro_id', user.id)
        .gte('date', today)
        .in('status', ['confirmed', 'pending'])
        .order('date', { ascending: true })
        .limit(3);

      if (error) throw error;

      // Format the data for display
      const formatted = data?.map((booking) => ({
        id: booking.id,
        clientName: `${booking.client?.prenom || ''} ${booking.client?.nom || ''}`.trim(),
        service: booking.service?.titre || 'Service',
        date: formatDate(booking.date),
        time: booking.heure,
        location: 'Non précisé', // Your reservations table doesn't have location column
        status: booking.status,
      })) || [];

      setRecentBookings(formatted);
    } catch (error) {
      console.error('Error loading recent bookings:', error);
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Demain';
    } else {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

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
        {loading ? (
          <Text style={styles.loadingText}>Chargement...</Text>
        ) : recentBookings.length === 0 ? (
          <Text style={styles.emptyText}>Aucune réservation à venir</Text>
        ) : (
          recentBookings.map((booking) => (
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
          ))
        )}
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
  loadingText: {
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  emptyText: {
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
});