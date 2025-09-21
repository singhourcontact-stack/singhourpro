import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MapPin, User, Phone } from 'lucide-react-native';

interface BookingCardProps {
  booking: {
    id: number;
    clientName: string;
    service: string;
    time: string;
    status: string;
  };
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#00C851';
      case 'pending':
        return '#ffbb33';
      case 'refused':
        return '#ff3b3b';
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
      case 'refused':
        return 'Refusé';
      default:
        return 'Inconnu';
    }
  };

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.header}>
        <View style={styles.clientInfo}>
          <User size={16} color="#666666" />
          <Text style={styles.clientName}>{booking.clientName}</Text>
        </View>
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

      <Text style={styles.service}>{booking.service}</Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Clock size={14} color="#666666" />
          <Text style={styles.detailText}>{booking.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
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
  service: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
  },
  details: {
    gap: 4,
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
});