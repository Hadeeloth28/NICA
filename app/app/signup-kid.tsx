import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { GradientBackground } from '../components/GradientBackground';
import { ApiError } from '../lib/api';
import { api, useAuth } from '../lib/auth-context';
import { colors } from '../lib/theme';

const AVATARS = ['😎', '🦄', '🐉', '🔥', '⚡', '🎸', '🏀', '🎮', '🌟', '🦊', '🐼', '🍕'];

export default function SignupKid() {
  const { signIn } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const valid = inviteCode && name && username && password.length >= 6;

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await api.signupKid({
        inviteCode: inviteCode.trim(),
        name: name.trim(),
        username: username.trim(),
        password,
        avatar,
      });
      await signIn(token, user);
      router.replace('/kid');
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
            <Text style={styles.emoji}>🎓</Text>
            <Text style={styles.title}>Join your family</Text>
            <Text style={styles.subtitle}>Ask your parent for the invite code.</Text>

            <Card>
              <Field
                label="Invite code"
                value={inviteCode}
                onChangeText={(t) => setInviteCode(t.toUpperCase())}
                placeholder="e.g. 4F82AB1C"
                autoCapitalize="characters"
              />
              <Field label="Your name" value={name} onChangeText={setName} placeholder="Alex" />
              <Field label="Choose a username" value={username} onChangeText={setUsername} placeholder="alex" />
              <Field
                label="Choose a password"
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                secureTextEntry
              />

              <Text style={styles.avatarLabel}>Pick your avatar</Text>
              <View style={styles.avatarRow}>
                {AVATARS.map((a) => (
                  <Pressable
                    key={a}
                    onPress={() => setAvatar(a)}
                    style={[styles.avatarChip, avatar === a && styles.avatarChipActive]}
                  >
                    <Text style={styles.avatarEmoji}>{a}</Text>
                  </Pressable>
                ))}
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <Button title="Let's Go!" onPress={submit} loading={loading} disabled={!valid} style={styles.button} />
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
  avatarLabel: { fontWeight: '700', color: colors.text, marginBottom: 8, fontSize: 14 },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  avatarChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardAlt,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#EDE0FF',
  },
  avatarEmoji: { fontSize: 22 },
});
