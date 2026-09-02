import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { GradientBackground } from '../components/GradientBackground';

export default function Welcome() {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Text style={styles.emoji}>🏆</Text>
          <Text style={styles.title}>NICA</Text>
          <Text style={styles.subtitle}>Crush your grades.{'\n'}Cash in your points.</Text>
        </View>

        <View style={styles.actions}>
          <Link href="/signup-kid" asChild>
            <Button title="I'm a Student 🎓" onPress={() => {}} variant="primary" />
          </Link>
          <Link href="/signup-parent" asChild>
            <Button title="I'm a Parent 👨‍👩‍👧" onPress={() => {}} variant="gold" style={styles.gap} />
          </Link>
          <Link href="/login" asChild>
            <Button title="Log In" onPress={() => {}} variant="ghost" style={styles.gap} />
          </Link>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 28, paddingBottom: 24 },
  hero: { alignItems: 'center', marginTop: '20%' },
  emoji: { fontSize: 72 },
  title: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: 4, marginTop: 8 },
  subtitle: { fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 12, lineHeight: 26 },
  actions: { gap: 0 },
  gap: { marginTop: 14 },
});
