import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
import { GradientBackground } from '../../components/GradientBackground';
import { ApiError, api } from '../../lib/api';
import { dollarsFromPoints, useFamily } from '../../lib/use-family';
import { useAuth } from '../../lib/auth-context';
import { colors, radius } from '../../lib/theme';

export default function Redeem() {
  const { user } = useAuth();
  const { data, loading } = useFamily();
  const [cashPoints, setCashPoints] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const me = data?.kids.find((k) => k.id === user?.id);
  const points = me?.points ?? 0;
  const pointValueCents = data?.settings.pointValueCents ?? 100;

  const redeemGift = async (giftId: string) => {
    setError(null);
    setSubmitting(giftId);
    try {
      await api.requestRedemption({ type: 'gift', giftId });
      setDone('Nice! Your parent will see your gift request.');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(null);
    }
  };

  const redeemCash = async () => {
    const n = Number(cashPoints);
    if (!n || n <= 0) return;
    setError(null);
    setSubmitting('cash');
    try {
      await api.requestRedemption({ type: 'cash', points: n });
      setCashPoints('');
      setDone('Cash-out requested! Your parent will confirm it.');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <GradientBackground colors={['#FF9F1C', '#FFC93C', '#8E2DE2']}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>

          <Text style={styles.emoji}>🎁</Text>
          <Text style={styles.title}>Cash in your points</Text>
          <Text style={styles.balance}>
            You have {points} point{points === 1 ? '' : 's'} ({dollarsFromPoints(points, pointValueCents)})
          </Text>

          {done && (
            <Card style={styles.doneCard}>
              <Text style={styles.doneText}>{done}</Text>
              <Button title="Back to dashboard" onPress={() => router.back()} variant="ghost" style={{ marginTop: 12 }} />
            </Card>
          )}

          {!done && (
            <>
              <Card style={styles.card}>
                <Text style={styles.cardTitle}>💵 Cash out</Text>
                <Field
                  label={`How many points? (worth ${dollarsFromPoints(Number(cashPoints) || 0, pointValueCents)})`}
                  value={cashPoints}
                  onChangeText={setCashPoints}
                  placeholder="10"
                  keyboardType="number-pad"
                />
                <Button
                  title="Request Cash Out"
                  onPress={redeemCash}
                  loading={submitting === 'cash'}
                  disabled={!cashPoints || Number(cashPoints) <= 0 || Number(cashPoints) > points}
                  variant="success"
                />
              </Card>

              <Text style={styles.sectionTitle}>Or pick a gift</Text>
              {(data?.gifts.length ?? 0) === 0 && !loading && (
                <Text style={styles.empty}>Your parent hasn't added any gifts yet.</Text>
              )}
              {data?.gifts.map((gift) => {
                const affordable = points >= gift.costPoints;
                return (
                  <Card key={gift.id} style={styles.giftCard}>
                    <View style={styles.giftRow}>
                      <Text style={styles.giftEmoji}>{gift.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.giftName}>{gift.name}</Text>
                        <Text style={styles.giftCost}>{gift.costPoints} points</Text>
                      </View>
                      <Pressable
                        onPress={() => redeemGift(gift.id)}
                        disabled={!affordable || submitting === gift.id}
                        style={[styles.giftButton, !affordable && styles.giftButtonDisabled]}
                      >
                        <Text style={styles.giftButtonText}>{affordable ? 'Redeem' : 'Locked'}</Text>
                      </Pressable>
                    </View>
                  </Card>
                );
              })}

              {error && <Text style={styles.error}>{error}</Text>}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingVertical: 20, paddingBottom: 48 },
  back: { marginBottom: 8 },
  backText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  emoji: { fontSize: 44, textAlign: 'center', marginTop: 8 },
  title: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 4 },
  balance: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 6, marginBottom: 20 },
  card: { marginBottom: 20 },
  cardTitle: { fontSize: 17, fontWeight: '900', color: colors.text, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#fff', marginBottom: 10 },
  empty: { color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  giftCard: { marginBottom: 10, paddingVertical: 14 },
  giftRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  giftEmoji: { fontSize: 30 },
  giftName: { fontSize: 16, fontWeight: '800', color: colors.text },
  giftCost: { fontSize: 13, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  giftButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill },
  giftButtonDisabled: { backgroundColor: colors.border },
  giftButtonText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  error: { color: '#fff', backgroundColor: colors.danger, padding: 10, borderRadius: 10, marginTop: 8, fontWeight: '700', textAlign: 'center' },
  doneCard: { alignItems: 'center', paddingVertical: 28 },
  doneText: { fontSize: 17, fontWeight: '800', color: colors.text, textAlign: 'center' },
});
