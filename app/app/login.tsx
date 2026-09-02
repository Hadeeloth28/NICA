import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { GradientBackground } from '../components/GradientBackground';
import { api, useAuth } from '../lib/auth-context';
import { ApiError } from '../lib/api';
import { colors } from '../lib/theme';

export default function Login() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await api.login({ username: username.trim(), password });
      await signIn(token, user);
      router.replace(user.role === 'parent' ? '/parent' : '/kid');
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
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.title}>Welcome back</Text>

            <Card>
              <Field label="Username" value={username} onChangeText={setUsername} placeholder="e.g. alex" />
              <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

              {error && <Text style={styles.error}>{error}</Text>}

              <Button title="Log In" onPress={submit} loading={loading} disabled={!username || !password} style={styles.button} />
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
  title: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 24 },
  button: { marginTop: 8 },
  error: { color: colors.danger, backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 10, fontWeight: '600' },
});
