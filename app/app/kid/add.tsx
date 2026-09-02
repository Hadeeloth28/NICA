import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
import { GradientBackground } from '../../components/GradientBackground';
import { ApiError, api } from '../../lib/api';
import { colors } from '../../lib/theme';

export default function AddAssignment() {
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [mark, setMark] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const markNum = Number(mark);
  const valid = subject && title && mark !== '' && !Number.isNaN(markNum) && markNum >= 0 && markNum <= 100;

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.createAssignment({ subject: subject.trim(), title: title.trim(), mark: markNum });
      router.back();
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
            <Text style={styles.emoji}>✏️</Text>
            <Text style={styles.title}>Log an assignment</Text>
            <Text style={styles.subtitle}>Your parent will need to approve it before points are awarded.</Text>

            <Card>
              <Field label="Subject" value={subject} onChangeText={setSubject} placeholder="Math" />
              <Field label="Assignment name" value={title} onChangeText={setTitle} placeholder="Algebra quiz" />
              <Field
                label="Your mark (0–100)"
                value={mark}
                onChangeText={setMark}
                placeholder="97"
                keyboardType="number-pad"
              />

              {error && <Text style={styles.error}>{error}</Text>}

              <Button title="Submit for Approval" onPress={submit} loading={loading} disabled={!valid} style={styles.button} />
              <Button title="Cancel" onPress={() => router.back()} variant="ghost" style={styles.button} />
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
  emoji: { fontSize: 44, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 4 },
  subtitle: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 6, marginBottom: 20 },
  button: { marginTop: 10 },
  error: { color: colors.danger, backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 10, fontWeight: '600' },
});
