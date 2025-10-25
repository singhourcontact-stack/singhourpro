import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatCard } from './StatCard';
import { Briefcase, Euro, Star, Users } from 'lucide-react-native';

interface ProfileStatsProps {
  completedJobs: number;
  monthlyRevenue: number;
  rating: number;
  totalReviews: number;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  completedJobs,
  monthlyRevenue,
  rating,
  totalReviews,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard
          icon={<Briefcase size={20} color="#ff3b3b" />}
          title="Missions Réalisées"
          value={completedJobs.toString()}
          subtitle="Total"
        />
        <StatCard
          icon={<Euro size={20} color="#ff3b3b" />}
          title="Revenus Mensuels"
          value={`${monthlyRevenue}€`}
          subtitle="Ce mois"
        />
      </View>
      
      <View style={styles.row}>
        <StatCard
          icon={<Star size={20} color="#ff3b3b" />}
          title="Note Moyenne"
          value={rating.toString()}
          subtitle="/5.0"
        />
        <StatCard
          icon={<Users size={20} color="#ff3b3b" />}
          title="Avis Clients"
          value={totalReviews.toString()}
          subtitle="Total"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
});