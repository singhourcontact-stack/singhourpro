import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, Calendar, Users, Euro } from 'lucide-react-native';
import { StatCard } from '@/components/StatCard';
import { QuickActions } from '@/components/QuickActions';
import { RecentBookings } from '@/components/RecentBookings';
import { AddOfferModal } from '@/components/AddOfferModal';

export default function HomeScreen() {
  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [stats, setStats] = useState({
    upcomingBookings: 0,
    revenue: 0,
    newRequests: 0,
    totalClients: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulation des données - remplacer par les vraies données Supabase
      setStats({
        upcomingBookings: 8,
        revenue: 2450,
        newRequests: 3,
        totalClients: 24,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.logo}>SINGHOUR'S</Text>
            <Text style={styles.subtitle}>Pro Dashboard</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            icon={<Calendar size={24} color="#ff3b3b" />}
            title="Prochaines Réservations"
            value={stats.upcomingBookings.toString()}
            subtitle="Cette semaine"
          />
          <StatCard
            icon={<Euro size={24} color="#ff3b3b" />}
            title="Chiffre d'Affaires"
            value={`${stats.revenue}€`}
            subtitle="Ce mois"
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            icon={<TrendingUp size={24} color="#ff3b3b" />}
            title="Nouvelles Demandes"
            value={stats.newRequests.toString()}
            subtitle="En attente"
          />
          <StatCard
            icon={<Users size={24} color="#ff3b3b" />}
            title="Total Clients"
            value={stats.totalClients.toString()}
            subtitle="Actifs"
          />
        </View>

        {/* Quick Actions */}
        <QuickActions onAddOffer={() => setShowAddOfferModal(true)} />

        {/* Recent Bookings */}
        <RecentBookings />

        {/* Add Offer Modal */}
        <AddOfferModal
          visible={showAddOfferModal}
          onClose={() => setShowAddOfferModal(false)}
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
    padding: 20,
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff3b3b',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 4,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
});