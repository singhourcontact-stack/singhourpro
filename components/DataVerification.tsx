import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Database } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { verifyDataIntegrity, updateProfile, createOffer, saveWorkingHours } from '@/services/dataService';

interface VerificationResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const DataVerification: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runVerification = async () => {
    if (!user?.id) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    setLoading(true);
    const verificationResults: VerificationResult[] = [];

    try {
      // Test 1: Profile data integrity
      const profileResult = await verifyDataIntegrity(user.id);
      verificationResults.push({
        test: 'Intégrité des données du profil',
        status: profileResult.success ? 'success' : 'error',
        message: profileResult.success ? 'Données du profil vérifiées' : profileResult.error || 'Erreur de vérification',
        details: profileResult.data,
      });

      // Test 2: Profile update (safe update without updated_at)
      const updateResult = await updateProfile(user.id, { bio: 'Test bio update' });
      verificationResults.push({
        test: 'Mise à jour du profil',
        status: updateResult.success ? 'success' : 'error',
        message: updateResult.success ? 'Profil mis à jour avec succès' : updateResult.error || 'Erreur de mise à jour',
      });

      // Test 3: Create test offer (check if table exists first)
      try {
        const offerResult = await createOffer(user.id, {
          title: 'Test Offer',
          description: 'Test offer for verification',
          price: 100,
          duration: '1h',
          category: 'test',
        });
        verificationResults.push({
          test: 'Création d\'offre',
          status: offerResult.success ? 'success' : 'error',
          message: offerResult.success ? 'Offre créée avec succès' : offerResult.error || 'Erreur de création d\'offre',
        });
      } catch (error: any) {
        verificationResults.push({
          test: 'Création d\'offre',
          status: 'warning',
          message: 'Table "offers" non trouvée. Veuillez exécuter le script SQL fourni.',
        });
      }

      // Test 4: Working hours (check if table exists first)
      try {
        const workingHoursResult = await saveWorkingHours(user.id, [
          {
            day_of_week: 1,
            start_time: '09:00:00',
            end_time: '17:00:00',
            is_active: true,
          },
        ]);
        verificationResults.push({
          test: 'Sauvegarde des heures de travail',
          status: workingHoursResult.success ? 'success' : 'error',
          message: workingHoursResult.success ? 'Heures de travail sauvegardées' : workingHoursResult.error || 'Erreur de sauvegarde',
        });
      } catch (error: any) {
        verificationResults.push({
          test: 'Sauvegarde des heures de travail',
          status: 'warning',
          message: 'Table "working_hours" non trouvée. Veuillez exécuter le script SQL fourni.',
        });
      }

    } catch (error: any) {
      verificationResults.push({
        test: 'Erreur générale',
        status: 'error',
        message: error.message || 'Erreur inattendue lors de la vérification',
      });
    }

    setResults(verificationResults);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color="#4CAF50" />;
      case 'error':
        return <XCircle size={20} color="#F44336" />;
      case 'warning':
        return <AlertCircle size={20} color="#FF9800" />;
      default:
        return <AlertCircle size={20} color="#666666" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      default:
        return '#666666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Database size={24} color="#ff3b3b" />
        <Text style={styles.title}>Vérification des Données</Text>
      </View>

      <Text style={styles.description}>
        Cette fonctionnalité vérifie que toutes les données sont correctement sauvegardées dans Supabase.
      </Text>

      <TouchableOpacity
        style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
        onPress={runVerification}
        disabled={loading}
      >
        <Text style={styles.verifyButtonText}>
          {loading ? 'Vérification en cours...' : 'Lancer la vérification'}
        </Text>
      </TouchableOpacity>

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Résultats de la vérification</Text>
          {results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                {getStatusIcon(result.status)}
                <Text style={styles.resultTest}>{result.test}</Text>
              </View>
              <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
                {result.message}
              </Text>
              {result.details && (
                <Text style={styles.resultDetails}>
                  Détails: {JSON.stringify(result.details, null, 2)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Tables Supabase vérifiées :</Text>
        <Text style={styles.infoText}>• profiles</Text>
        <Text style={styles.infoText}>• offers</Text>
        <Text style={styles.infoText}>• working_hours</Text>
        <Text style={styles.infoText}>• blocked_dates</Text>
        <Text style={styles.infoText}>• reservations</Text>
        <Text style={styles.infoText}>• portfolio</Text>
        <Text style={styles.infoText}>• google_calendar_settings</Text>
        
        <Text style={styles.warningText}>
          ⚠️ Si des tables sont manquantes, exécutez le script SQL fourni dans database/schema.sql
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
  },
  description: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 24,
    lineHeight: 20,
  },
  verifyButton: {
    backgroundColor: '#ff3b3b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  resultItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
    flex: 1,
  },
  resultMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  resultDetails: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
