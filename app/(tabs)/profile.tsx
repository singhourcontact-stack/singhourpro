import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Camera, Edit3, MapPin, Phone, Mail, Star } from 'lucide-react-native';
import { ProfileStats } from '@/components/ProfileStats';
import { PortfolioGrid } from '@/components/PortfolioGrid';
import { EditProfileModal } from '@/components/EditProfileModal';
import { ProfilePicturePicker } from '@/components/ProfilePicturePicker';
import { LocationPicker } from '@/components/LocationPicker';
import { OnlineStatusToggle } from '@/components/OnlineStatusToggle';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, updateProfile } from '@/services/dataService';
import { getProfileStats } from '@/services/profileService';
import { fetchPortfolio } from '@/services/portfolioService';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [stats, setStats] = useState({
    completedJobs: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('Tous');
  const categories = ['Tous', 'Portrait', 'Mariage', 'Événement', 'Produit', 'Architecture', 'Nature', 'Autre'];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  // Reload profile when returning from other screens
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadProfile();
      }
    }, [user])
  );

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Load profile data using the new service
      const profileResult = await getProfile(user.id);
      if (profileResult.success && profileResult.data) {
        setProfile(profileResult.data);
      }

      // Load profile statistics
      const profileStats = await getProfileStats(user.id);
      setStats(profileStats);

      // Load portfolio
      const portfolioData = await fetchPortfolio(user.id);
      setPortfolio(portfolioData || []);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      Alert.alert('Erreur', 'Impossible de charger le profil');
    } finally {
      setLoading(false);
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
          <ProfilePicturePicker
            currentImageUrl={profile.photo_url}
            onImageUpdated={(newImageUrl) => {
              setProfile({ ...profile, photo_url: newImageUrl });
            }}
            size={120}
          />

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.prenom} {profile.nom}</Text>

            {/* Online Status Toggle */}
            <OnlineStatusToggle
              onStatusChange={(isOnline) => {
                // Note: is_online column doesn't exist in your database
                // This is kept for UI compatibility but doesn't update the database
                console.log('Online status changed:', isOnline);
              }}
              size="medium"
            />

            <View style={styles.ratingContainer}>
              <Star size={16} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{stats.averageRating}</Text>
              <Text style={styles.reviewCount}>({stats.totalReviews} avis)</Text>
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Mail size={16} color="#666666" />
                <Text style={styles.contactText}>{profile.email || 'Email non renseigné'}</Text>
              </View>
              <View style={styles.contactItem}>
                <Phone size={16} color="#666666" />
                <Text style={[
                  styles.contactText, 
                  !profile.telephone && styles.placeholderText
                ]}>
                  {profile.telephone || 'Téléphone non renseigné'}
                </Text>
              </View>
              <View style={styles.contactItem}>
                <MapPin size={16} color="#666666" />
                <Text style={[
                  styles.contactText, 
                  !profile.adresse && styles.placeholderText
                ]}>
                  {profile.adresse || 'Adresse non renseignée'}
                </Text>
              </View>
            </View>

            <Text style={[
              styles.bio, 
              !profile.societe && styles.placeholderText
            ]}>
              {profile.societe || 'Société non renseignée'}
            </Text>

            {/* Profile completion reminder */}
            {(!profile.telephone || !profile.adresse || !profile.societe) && (
              <View style={styles.completionReminder}>
                <Text style={styles.completionText}>
                  💡 Complétez votre profil pour améliorer votre visibilité
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Location Picker */}
        <LocationPicker
          currentLocation={profile.location}
          onLocationUpdated={(location) => {
            setProfile({ ...profile, location });
          }}
        />

        {/* Statistics */}
        <ProfileStats
          completedJobs={stats.completedJobs}
          monthlyRevenue={stats.monthlyRevenue}
          rating={stats.averageRating}
          totalReviews={stats.totalReviews}
        />

        {/* Portfolio */}
        <View style={styles.portfolioSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <TouchableOpacity onPress={() => router.push('/portfolio/add-photo')}>
              <Text style={styles.addButton}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategoryFilter(cat)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: categoryFilter === cat ? '#ff3b3b' : '#1a1a1a',
                    borderWidth: 1,
                    borderColor: categoryFilter === cat ? '#ff3b3b' : '#2a2a2a',
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <PortfolioGrid
            portfolio={portfolio
              .filter((p: any) => categoryFilter === 'Tous' || (p.category || 'Autre') === categoryFilter)
              .map((p: any) => ({
                id: p.id,
                media_url: p.photo_url, // Use photo_url from database
                media_type: 'image', // Default to image since media_type column doesn't exist
              }))}
            onDeleted={(id) => setPortfolio((prev) => prev.filter((p: any) => p.id !== id))}
          />
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
  placeholderText: { color: '#666666', fontStyle: 'italic' },
  bio: { color: '#cccccc', textAlign: 'center', lineHeight: 20 },
  completionReminder: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  completionText: {
    color: '#ff3b3b',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  portfolioSection: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  addButton: { color: '#ff3b3b', fontSize: 16, fontWeight: '600' },
});
