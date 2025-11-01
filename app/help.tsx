import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Linking,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone, Mail, MessageCircle, ChevronDown, ChevronUp, Search, Star, Send, X } from 'lucide-react-native';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function HelpScreen() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: ''
  });
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
    },
    {
      id: 6,
      question: "Comment gérer mon profil professionnel ?",
      answer: "Dans l'onglet Profil, vous pouvez modifier vos informations, ajouter des photos à votre portfolio, gérer vos disponibilités et configurer vos moyens de paiement."
    },
    {
      id: 7,
      question: "Comment configurer mes notifications ?",
      answer: "Allez dans Paramètres > Notifications pour personnaliser vos préférences. Vous pouvez activer/désactiver les notifications pour les réservations, paiements, emails et push."
    },
    {
      id: 8,
      question: "Comment synchroniser mon calendrier Google ?",
      answer: "Dans l'onglet Calendrier, cliquez sur 'Google Calendar' pour connecter votre compte. Vos événements seront automatiquement synchronisés pour bloquer vos créneaux."
    }
  ];

  // Filter FAQ based on search query
  const filteredFAQ = faqData.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const submitContactForm = () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Mock submission - in real app, send to backend
    Alert.alert(
      'Message envoyé',
      'Votre demande de support a été envoyée. Nous vous répondrons dans les 24h.',
      [{ text: 'OK', onPress: () => setShowContactModal(false) }]
    );
    
    // Reset form
    setContactForm({ subject: '', message: '', priority: 'normal' });
  };

  const submitFeedback = () => {
    if (feedback.rating === 0) {
      Alert.alert('Erreur', 'Veuillez donner une note');
      return;
    }

    // Mock submission - in real app, send to backend
    Alert.alert(
      'Merci pour votre avis',
      'Votre feedback nous aide à améliorer l\'application.',
      [{ text: 'OK', onPress: () => setShowFeedbackModal(false) }]
    );
    
    // Reset feedback
    setFeedback({ rating: 0, comment: '' });
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

            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => setShowContactModal(true)}
            >
              <MessageCircle size={20} color="#ff3b3b" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Formulaire de contact</Text>
                <Text style={styles.contactDetail}>Envoyez-nous un message</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#666666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Rechercher dans les FAQ..."
              placeholderTextColor="#666666"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.faqContainer}>
            {filteredFAQ.map((item) => (
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

        {/* Feedback Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Votre avis nous intéresse</Text>
          <TouchableOpacity 
            style={styles.feedbackButton}
            onPress={() => setShowFeedbackModal(true)}
          >
            <Star size={20} color="#ff3b3b" />
            <Text style={styles.feedbackButtonText}>Donner votre avis</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Contact Form Modal */}
      <Modal visible={showContactModal} animationType="slide" presentationStyle="formSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Contactez-nous</Text>
            <TouchableOpacity onPress={() => setShowContactModal(false)}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sujet *</Text>
              <TextInput
                style={styles.textInput}
                value={contactForm.subject}
                onChangeText={(text) => setContactForm({...contactForm, subject: text})}
                placeholder="Décrivez votre problème..."
                placeholderTextColor="#666666"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={contactForm.message}
                onChangeText={(text) => setContactForm({...contactForm, message: text})}
                placeholder="Détaillez votre demande..."
                placeholderTextColor="#666666"
                multiline
                numberOfLines={6}
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowContactModal(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={submitContactForm}>
              <Send size={16} color="#ffffff" />
              <Text style={styles.submitButtonText}>Envoyer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal visible={showFeedbackModal} animationType="slide" presentationStyle="formSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Donner votre avis</Text>
            <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Note *</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setFeedback({...feedback, rating: star})}
                    style={styles.starButton}
                  >
                    <Star 
                      size={32} 
                      color={star <= feedback.rating ? "#FFD700" : "#666666"} 
                      fill={star <= feedback.rating ? "#FFD700" : "transparent"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Commentaire (optionnel)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={feedback.comment}
                onChangeText={(text) => setFeedback({...feedback, comment: text})}
                placeholder="Partagez votre expérience..."
                placeholderTextColor="#666666"
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowFeedbackModal(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={submitFeedback}>
              <Star size={16} color="#ffffff" />
              <Text style={styles.submitButtonText}>Envoyer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  feedbackButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#ff3b3b',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});