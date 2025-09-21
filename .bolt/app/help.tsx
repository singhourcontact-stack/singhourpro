import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Linking,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone, Mail, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react-native';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function HelpScreen() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const router = useRouter();

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "Comment réserver un service ?",
      answer: "Pour réserver un service, parcourez les offres disponibles, sélectionnez celle qui vous intéresse, choisissez une date et heure, puis confirmez votre réservation. Vous recevrez une confirmation par email."
    },
    {
      id: 2,
      question: "Quels sont les moyens de paiement acceptés ?",
      answer: "Nous acceptons les cartes bancaires (Visa, Mastercard), PayPal et les virements bancaires. Tous les paiements sont sécurisés et cryptés."
    },
    {
      id: 3,
      question: "Puis-je annuler ou modifier ma réservation ?",
      answer: "Oui, vous pouvez annuler ou modifier votre réservation jusqu'à 24h avant la date prévue. Au-delà, des frais d'annulation peuvent s'appliquer selon les conditions du prestataire."
    },
    {
      id: 4,
      question: "Comment contacter un prestataire ?",
      answer: "Une fois votre réservation confirmée, vous recevrez les coordonnées du prestataire. Vous pouvez également utiliser la messagerie intégrée dans l'application."
    },
    {
      id: 5,
      question: "Que faire en cas de problème avec un service ?",
      answer: "En cas de problème, contactez immédiatement notre support client. Nous médierons entre vous et le prestataire pour trouver une solution satisfaisante."
    }
  ];

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const callSupport = () => {
    const phoneNumber = '+33 1 23 45 67 89';
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application téléphone');
    });
  };

  const emailSupport = () => {
    const email = 'support@singhours.com';
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application email');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Centre d'aide</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contactez-nous</Text>
          <Text style={styles.sectionSubtitle}>
            Notre équipe support est disponible du lundi au vendredi de 9h à 18h
          </Text>

          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactButton} onPress={callSupport}>
              <Phone size={20} color="#ff3b3b" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Téléphone</Text>
                <Text style={styles.contactDetail}>+33 1 23 45 67 89</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactButton} onPress={emailSupport}>
              <Mail size={20} color="#ff3b3b" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Email</Text>
                <Text style={styles.contactDetail}>support@singhours.com</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactButton}>
              <MessageCircle size={20} color="#ff3b3b" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Chat en direct</Text>
                <Text style={styles.contactDetail}>Disponible 24h/7j</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          
          <View style={styles.faqContainer}>
            {faqData.map((item) => (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity 
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(item.id)}
                >
                  <Text style={styles.faqQuestionText}>{item.question}</Text>
                  {expandedFAQ === item.id ? (
                    <ChevronUp size={20} color="#ff3b3b" />
                  ) : (
                    <ChevronDown size={20} color="#666666" />
                  )}
                </TouchableOpacity>
                
                {expandedFAQ === item.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ressources utiles</Text>
          
          <TouchableOpacity style={styles.resourceButton}>
            <Text style={styles.resourceButtonText}>Guide d'utilisation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceButton}>
            <Text style={styles.resourceButtonText}>Conditions d'utilisation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceButton}>
            <Text style={styles.resourceButtonText}>Politique de confidentialité</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>Urgence ?</Text>
          <Text style={styles.emergencyText}>
            Pour toute urgence concernant une réservation en cours, appelez-nous directement au :
          </Text>
          <TouchableOpacity style={styles.emergencyButton} onPress={callSupport}>
            <Phone size={18} color="#ffffff" />
            <Text style={styles.emergencyButtonText}>+33 1 23 45 67 89</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  section: {
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  contactButtons: {
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: 14,
    color: '#666666',
  },
  faqContainer: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    marginTop: 12,
  },
  resourceButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  resourceButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  emergencySection: {
    backgroundColor: '#ff3b3b',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});