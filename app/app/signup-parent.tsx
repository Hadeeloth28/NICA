import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { GradientBackground } from '../components/GradientBackground';
import { ApiError } from '../lib/api';
import { api, useAuth } from '../lib/auth-context';
import { colors } from '../lib/theme';

export default function SignupParent() {
  const { signIn } = useAuth();
  const [familyName, setFamilyName] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const valid = familyName && name && username && password.length >= 6;

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await api.signupParent({
        familyName: familyName.trim(),
        name: name.trim(),
        username: username.trim(),
        password,
      });
      await signIn(token, user);
      router.replace('/parent');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.emoji}>👨‍👩‍👧</Text>
            <Text style={styles.title}>Set up your family</Text>
            <Text style={styles.subtitle}>You'll get an invite code your kid uses to join.</Text>

            <Card>
              <Field label="Family name" value={familyName} onChangeText={setFamilyName} placeholder="The Smiths" />
              <Field label="Your name" value={name} onChangeText={setName} placeholder="Dana" />
              <Field label="Choose a username" value={username} onChangeText={setUsername} placeholder="dana" />
              <Field
                label="Choose a password"
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                secureTextEntry
              />

              {error && <Text style={styles.error}>{error}</Text>}

              <Button title="Create Family" onPress={submit} loading={loading} disabled={!valid} style={styles.button} variant="gold" />
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  emoji: { fontSize: 48, textAlign: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 4 },
  subtitle: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 6, marginBottom: 20 },
  button: { marginTop: 8 },
  error: { color: colors.danger, backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 10, fontWeight: '600' },
});
