import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Phone, Mail, MapPin, Clock, Euro, MessageCircle } from 'lucide-react-native';

interface BookingRequestCardProps {
  booking: {
    id: number;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    service: string;
    date: string;
    time: string;
    duration: string;
    price: number;
    status: string;
    message: string;
    location: string;
  };
  onAccept: () => void;
  onRefuse: () => void;
}

export const BookingRequestCard: React.FC<BookingRequestCardProps> = ({ 
  booking, 
  onAccept, 
  onRefuse 
}) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.clientInfo}>
          <User size={18} color="#ff3b3b" />
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

      {/* Service */}
      <Text style={styles.service}>{booking.service}</Text>

      {/* Booking Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Clock size={16} color="#666666" />
          <Text style={styles.detailText}>
            {formatDate(booking.date)} à {booking.time} ({booking.duration})
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color="#666666" />
          <Text style={styles.detailText}>{booking.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Euro size={16} color="#666666" />
          <Text style={styles.detailText}>{booking.price}€</Text>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Contact Client</Text>
        <View style={styles.contactDetails}>
          <View style={styles.contactRow}>
            <Mail size={14} color="#666666" />
            <Text style={styles.contactText}>{booking.clientEmail}</Text>
          </View>
          <View style={styles.contactRow}>
            <Phone size={14} color="#666666" />
            <Text style={styles.contactText}>{booking.clientPhone}</Text>
          </View>
        </View>
      </View>

      {/* Message */}
      <View style={styles.messageSection}>
        <View style={styles.messageTitleRow}>
          <MessageCircle size={16} color="#666666" />
          <Text style={styles.messageTitle}>Message du client</Text>
        </View>
        <Text style={styles.messageText}>{booking.message}</Text>
      </View>

      {/* Action Buttons */}
      {booking.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.refuseButton} onPress={onRefuse}>
            <Text style={styles.refuseButtonText}>Refuser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <Text style={styles.acceptButtonText}>Accepter</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  service: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ff3b3b',
    marginBottom: 16,
  },
  details: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#cccccc',
    flex: 1,
  },
  contactSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  contactDetails: {
    gap: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: '#cccccc',
  },
  messageSection: {
    marginBottom: 20,
  },
  messageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  messageText: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  refuseButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff3b3b',
    alignItems: 'center',
  },
  refuseButtonText: {
    color: '#ff3b3b',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ff3b3b',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});