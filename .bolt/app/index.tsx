import { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('IndexScreen: useEffect triggered', { user: !!user, loading });
    
    // Force redirect after 3 seconds if still loading
    const timeout = setTimeout(() => {
      console.log('IndexScreen: Forcing redirect due to timeout');
      router.replace('/login');
    }, 3000);

    if (!loading) {
      clearTimeout(timeout);
      if (!user) {
        // User is not signed in, redirect to login
        console.log('IndexScreen: Redirecting to login');
        router.replace('/login');
      } else {
        // User is signed in, redirect to tabs
        console.log('IndexScreen: Redirecting to tabs');
        router.replace('/(tabs)');
      }
    }

    return () => clearTimeout(timeout);
  }, [user, loading, router]);

  if (loading) {
    console.log('IndexScreen: Showing loading screen');
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>SINGHOUR'S</Text>
        <Text style={styles.subtitle}>Chargement...</Text>
      </View>
    );
  }

  console.log('IndexScreen: Should not reach here - showing fallback');
  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>SINGHOUR'S</Text>
      <Text style={styles.subtitle}>Chargement...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff3b3b',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
});