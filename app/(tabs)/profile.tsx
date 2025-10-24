import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, Edit3, MapPin, Phone, Mail, Star } from 'lucide-react-native';
import { ProfileStats } from '@/components/ProfileStats';
import { PortfolioGrid } from '@/components/PortfolioGrid';
import { EditProfileModal } from '@/components/EditProfileModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      // 1️⃣ Charger les infos du profil
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      // 2️⃣ Charger le nombre de missions réalisées
      const { count: completedJobs } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('pro_id', user.id)
        .eq('status', 'terminee'); // exemple de status terminé

      // 3️⃣ Revenu mensuel
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const { data: payments } = await supabase
        .from('payments')
        .select('montant, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      const monthlyRevenue =
        payments?.reduce((sum, p) => sum + (p.montant || 0), 0) || 0;

      // 4️⃣ Nombre total d’avis (si tu as une table `reviews`, sinon mettre 0)
      const totalReviews = 127; // TODO: remplacer par ta vraie requête

      setProfile({
        ...profileData,
        completedJobs: completedJobs || 0,
        monthlyRevenue,
        rating: 4.8, // TODO: calculer moyenne si tu as une table d’avis
        totalReviews,
      });

      // 5️⃣ Charger portfolio (exemple si tu stockes les photos dans `services`)
      const { data: services } = await supabase
        .from('services')
        .select('photo_url')
        .eq('pro_id', user.id);

      setPortfolio(
        services?.map((s, idx) => ({
          id: idx,
          url: s.photo_url,
          type: 'image',
        })) || []
      );
    } catch (err) {
      console.error('Erreur chargement profil:', err);
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 50 }}>
          Chargement du profil...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mon Profil</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <Edit3 size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Camera size={40} color="#666666" />
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => router.push('/profile/edit-photo')}
            >
              <Camera size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.prenom} {profile.nom}</Text>

            {/* Type + Disponibilité */}
            <Text style={{ color: '#ff3b3b', fontWeight: '600', marginBottom: 5 }}>
              {profile.type === 'studio'
                ? 'Studio'
                : profile.type === 'photographe'
                ? 'Photographe'
                : 'Réalisateur vidéo'} 
              {profile.is_online ? ' 🟢 En ligne' : ' 🔴 Hors ligne'}
            </Text>

            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{profile.rating}</Text>
              <Text style={styles.reviewCount}>({profile.totalReviews} avis)</Text>
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Mail size={16} color="#666666" />
                <Text style={styles.contactText}>{profile.email}</Text>
              </View>
              <View style={styles.contactItem}>
                <Phone size={16} color="#666666" />
                <Text style={styles.contactText}>{profile.telephone}</Text>
              </View>
              <View style={styles.contactItem}>
                <MapPin size={16} color="#666666" />
                <Text style={styles.contactText}>{profile.adresse}</Text>
              </View>
            </View>

            <Text style={styles.bio}>{profile.societe}</Text>
          </View>
        </View>

        {/* Statistics */}
        <ProfileStats
          completedJobs={profile.completedJobs}
          monthlyRevenue={profile.monthlyRevenue}
          rating={profile.rating}
          totalReviews={profile.totalReviews}
        />

        {/* Portfolio */}
        <View style={styles.portfolioSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <TouchableOpacity>
              <Text style={styles.addButton}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
          <PortfolioGrid portfolio={portfolio} />
        </View>

        {/* Edit Profile Modal */}
        <EditProfileModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profile}
          onSave={setProfile}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  editButton: { padding: 8, backgroundColor: '#1a1a1a', borderRadius: 8 },
  profileSection: { padding: 20, backgroundColor: '#1a1a1a', margin: 20, borderRadius: 16 },
  avatarContainer: { alignItems: 'center', marginBottom: 20, position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#ff3b3b' },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#ff3b3b' },
  cameraButton: { position: 'absolute', bottom: 0, right: '35%', backgroundColor: '#ff3b3b', padding: 8, borderRadius: 20 },
  profileInfo: { alignItems: 'center' },
  profileName: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  rating: { fontSize: 16, fontWeight: '600', color: '#ffffff', marginLeft: 4 },
  reviewCount: { fontSize: 14, color: '#666666', marginLeft: 4 },
  contactInfo: { marginBottom: 15 },
  contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  contactText: { color: '#ffffff', marginLeft: 8, fontSize: 14 },
  bio: { color: '#cccccc', textAlign: 'center', lineHeight: 20 },
  portfolioSection: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  addButton: { color: '#ff3b3b', fontSize: 16, fontWeight: '600' },
});
