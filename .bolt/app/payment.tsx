import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, Lock, Calendar } from 'lucide-react-native';

export default function PaymentScreen() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [amount] = useState('250'); // Montant simulé
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardHolder) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    
    // Simulation d'un paiement (remplacer par un vrai provider plus tard)
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Paiement réussi',
        `Votre paiement de ${amount}€ a été traité avec succès.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Paiement</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Montant à payer</Text>
          <Text style={styles.amountValue}>{amount}€</Text>
        </View>

        {/* Payment Form */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Informations de paiement</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numéro de carte</Text>
            <View style={styles.inputWrapper}>
              <CreditCard size={20} color="#666666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#666666"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Date d'expiration</Text>
              <View style={styles.inputWrapper}>
                <Calendar size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  placeholder="MM/AA"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>CVV</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du titulaire</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { paddingLeft: 16 }]}
                value={cardHolder}
                onChangeText={setCardHolder}
                placeholder="Jean Dupont"
                placeholderTextColor="#666666"
                autoCapitalize="words"
              />
            </View>
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Lock size={16} color="#00C851" />
          <Text style={styles.securityText}>
            Vos informations de paiement sont sécurisées et cryptées
          </Text>
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          <Text style={styles.payButtonText}>
            {loading ? 'Traitement...' : `Payer ${amount}€`}
          </Text>
        </TouchableOpacity>
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
  amountSection: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#1a1a1a',
    margin: 20,
    borderRadius: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff3b3b',
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  securityText: {
    fontSize: 12,
    color: '#00C851',
    marginLeft: 8,
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: '#ff3b3b',
    borderRadius: 12,
    paddingVertical: 18,
    marginHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});