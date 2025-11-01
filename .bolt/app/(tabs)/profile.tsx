import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, CreditCard as Edit3, MapPin, Phone, Mail, Star, TrendingUp } from 'lucide-react-native';
import { ProfileStats } from '@/components/ProfileStats';
import { PortfolioGrid } from '@/components/PortfolioGrid';
import { EditProfileModal } from '@/components/EditProfileModal';

export default function ProfileScreen() {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Studio SINGHOUR\'S',
    email: 'contact@singhours.com',
    phone: '+33 6 12 34 56 78',
    address: '123 Rue de la Photographie, 75001 Paris',
    bio: 'Studio professionnel spécialisé dans la photographie de portrait, mariage et événements. Plus de 10 ans d\'expérience.',
    avatar: null,
    rating: 4.8,
    totalReviews: 127,
    completedJobs: 245,
    monthlyRevenue: 3250,
  });

  const [portfolio, setPortfolio] = useState([
    { id: 1, url: 'https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg', type: 'image' },
    { id: 2, url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg', type: 'image' },
    { id: 3, url: 'https://images.pexels.com/photos/1385472/pexels-photo-1385472.jpeg', type: 'image' },
    { id: 4, url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg', type: 'image' },
    { id: 5, url: 'https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg', type: 'image' },
    { id: 6, url: 'https://images.pexels.com/photos/1375849/pexels-photo-1375849.jpeg', type: 'image' },
  ]);

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
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
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
            <Text style={styles.profileName}>{profile.name}</Text>
            
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
                <Text style={styles.contactText}>{profile.phone}</Text>
              </View>
              <View style={styles.contactItem}>
                <MapPin size={16} color="#666666" />
                <Text style={styles.contactText}>{profile.address}</Text>
              </View>
            </View>

            <Text style={styles.bio}>{profile.bio}</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  profileSection: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    margin: 20,
    borderRadius: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#ff3b3b',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ff3b3b',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#ff3b3b',
    padding: 8,
    borderRadius: 20,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  contactInfo: {
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 14,
  },
  bio: {
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 20,
  },
  portfolioSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  addButton: {
    color: '#ff3b3b',
    fontSize: 16,
    fontWeight: '600',
  },
});