import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { supabaseClient } from './supabaseClient'; // adapte le chemin si nécessaire

export default function TestSupabase() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function testConnection() {
      try {
        // test simple : récupérer 1 utilisateur (ou un dummy query)
        const { data, error } = await supabaseClient.from('users').select('*').limit(1);
        if (error) {
          setStatus('error');
          setMessage(error.message);
        } else {
          setStatus('ok');
          setMessage(`Connexion réussie ! ${data?.length} entrée(s) trouvée(s)`);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message);
      }
    }

    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      {status === 'loading' && <ActivityIndicator size="large" />}
      {status === 'ok' && <Text style={styles.ok}>{message}</Text>}
      {status === 'error' && <Text style={styles.error}>Erreur : {message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ok: { color: 'green', fontSize: 16 },
  error: { color: 'red', fontSize: 16 },
});
