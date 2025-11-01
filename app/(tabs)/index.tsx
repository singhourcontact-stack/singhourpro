import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, Calendar, Users, Euro } from 'lucide-react-native';
import { StatCard } from '@/components/StatCard';
import { QuickActions } from '@/components/QuickActions';
import { RecentBookings } from '@/components/RecentBookings';
import { AddOfferModal } from '@/components/AddOfferModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [stats, setStats] = useState({
    upcomingBookings: 0,
    revenue: 0,
    newRequests: 0,
    totalClients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

      // Get upcoming bookings (this week)
      const { data: upcomingBookings, error: bookingsError } = await supabase
        .from('reservations')
        .select('id')
        .eq('pro_id', user.id)
        .gte('date', today)
        .in('status', ['confirmed', 'pending']);

      if (bookingsError) throw bookingsError;

      // Get monthly revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from('reservations')
        .select('montant')
        .eq('pro_id', user.id)
        .eq('status', 'confirmed')
        .gte('date', startOfMonthStr);

      if (revenueError) throw revenueError;

      // Get new requests (pending status)
      const { data: newRequests, error: requestsError } = await supabase
        .from('reservations')
        .select('id')
        .eq('pro_id', user.id)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      // Get total unique clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('reservations')
        .select('client_id')
        .eq('pro_id', user.id)
        .eq('status', 'confirmed');

      if (clientsError) throw clientsError;

      // Calculate unique clients
      const uniqueClients = new Set(clientsData?.map(r => r.client_id) || []).size;

      // Calculate total revenue
      const totalRevenue = revenueData?.reduce((sum, r) => sum + (r.montant || 0), 0) || 0;

      setStats({
        upcomingBookings: upcomingBookings?.length || 0,
        revenue: totalRevenue,
        newRequests: newRequests?.length || 0,
        totalClients: uniqueClients,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values on error
      setStats({
        upcomingBookings: 0,
        revenue: 0,
        newRequests: 0,
        totalClients: 0,
      });
    } finally {
      setLoading(false);
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