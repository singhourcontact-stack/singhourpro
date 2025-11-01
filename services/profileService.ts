import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export interface ProfileData {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  address?: string;
  bio?: string;
  photo_url?: string;
  is_online?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  societe?: string;
  photo_url?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

/**
 * Get profile data for a user
 * @param userId - The user's ID
 * @returns Promise<ProfileData | null>
 */
export async function getProfile(userId: string): Promise<ProfileData | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Profile not found
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

/**
 * Update profile data
 * @param userId - The user's ID
 * @param updates - Profile updates
 * @returns Promise<boolean> - Success status
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdateData
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        // Note: updated_at column doesn't exist in your database
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}

/**
 * Upload profile picture to Supabase Storage
 * @param userId - The user's ID
 * @param imageUri - Local image URI
 * @returns Promise<string | null> - Public URL or null if failed
 */
export async function uploadProfilePicture(
  userId: string,
  imageUri: string
): Promise<string | null> {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `profile-${userId}-${timestamp}.jpg`;
    const filePath = `profiles/${filename}`;

    // Convert image to base64 for React Native
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Convert blob to base64 string
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
    reader.readAsDataURL(blob);
    const base64Data = await base64Promise;
    
    // Remove data URL prefix to get just the base64 data
    const base64String = base64Data.split(',')[1];
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, bytes, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return null;
  }
}

/**
 * Pick and upload profile picture
 * @param userId - The user's ID
 * @returns Promise<string | null> - Public URL or null if failed
 */
export async function pickAndUploadProfilePicture(
  userId: string
): Promise<string | null> {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library was denied');
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const imageUri = result.assets[0].uri;
    
    // Upload to Supabase
    const publicUrl = await uploadProfilePicture(userId, imageUri);
    
    if (publicUrl) {
      // Update profile with new avatar URL
      await updateProfile(userId, { photo_url: publicUrl });
    }

    return publicUrl;
  } catch (error) {
    console.error('Error picking and uploading profile picture:', error);
    return null;
  }
}

/**
 * Take and upload profile picture with camera
 * @param userId - The user's ID
 * @returns Promise<string | null> - Public URL or null if failed
 */
export async function takeAndUploadProfilePicture(
  userId: string
): Promise<string | null> {
  try {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access camera was denied');
    }

    // Take picture
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const imageUri = result.assets[0].uri;
    
    // Upload to Supabase
    const publicUrl = await uploadProfilePicture(userId, imageUri);
    
    if (publicUrl) {
      // Update profile with new avatar URL
      await updateProfile(userId, { photo_url: publicUrl });
    }

    return publicUrl;
  } catch (error) {
    console.error('Error taking and uploading profile picture:', error);
    return null;
  }
}

/**
 * Toggle online status
 * @param userId - The user's ID
 * @param isOnline - Online status
 * @returns Promise<boolean> - Success status
 */
export async function toggleOnlineStatus(
  userId: string,
  isOnline: boolean
): Promise<boolean> {
  try {
    // Note: is_online column doesn't exist in your database
    // This function is kept for compatibility but doesn't update the database
    console.log('Online status toggle requested:', isOnline);
    return true; // Return success without database update
  } catch (error) {
    console.error('Error toggling online status:', error);
    return false;
  }
}

/**
 * Update location
 * @param userId - The user's ID
 * @param location - Location data
 * @returns Promise<boolean> - Success status
 */
export async function updateLocation(
  userId: string,
  location: {
    latitude: number;
    longitude: number;
    address: string;
  }
): Promise<boolean> {
  try {
    return await updateProfile(userId, { location });
  } catch (error) {
    console.error('Error updating location:', error);
    return false;
  }
}

/**
 * Get profile statistics
 * @param userId - The user's ID
 * @returns Promise<any> - Profile statistics
 */
export async function getProfileStats(userId: string): Promise<any> {
  try {
    // Get completed jobs count
    const { count: completedJobs } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('pro_id', userId)
      .eq('status', 'completed');

    // Get monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: revenueData } = await supabase
      .from('reservations')
      .select('montant')
      .eq('pro_id', userId)
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString());

    const monthlyRevenue = revenueData?.reduce((sum, r) => sum + (r.montant || 0), 0) || 0;

    // Get average rating (reviews table doesn't exist yet, return default values)
    const averageRating = 0;

    return {
      completedJobs: completedJobs || 0,
      monthlyRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: 0, // No reviews table yet
    };
  } catch (error) {
    console.error('Error getting profile stats:', error);
    return {
      completedJobs: 0,
      monthlyRevenue: 0,
      averageRating: 0,
      totalReviews: 0,
    };
  }
}
