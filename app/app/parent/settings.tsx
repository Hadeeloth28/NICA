import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Field } from '../../components/Field';
import { GradientBackground } from '../../components/GradientBackground';
import { ApiError, api } from '../../lib/api';
import { useFamily } from '../../lib/use-family';
import { colors } from '../../lib/theme';

const EMOJIS = ['🎁', '🍿', '🎮', '👟', '🍕', '🎧', '📱', '🛹', '💄', '⚽'];

export default function ParentSettings() {
  const { data, reload } = useFamily();
  const [threshold, setThreshold] = useState('95');
  const [dollarsPerPoint, setDollarsPerPoint] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const [giftName, setGiftName] = useState('');
  const [giftEmoji, setGiftEmoji] = useState(EMOJIS[0]);
  const [giftCost, setGiftCost] = useState('');
  const [addingGift, setAddingGift] = useState(false);

  useEffect(() => {
    if (data) {
      setThreshold(String(data.settings.threshold));
      setDollarsPerPoint((data.settings.pointValueCents / 100).toString());
    }
  }, [data]);

  const saveSettings = async () => {
    setError(null);
    setSaving(true);
    try {
      await api.updateSettings({
        threshold: Number(threshold),
        pointValueCents: Math.round(Number(dollarsPerPoint) * 100),
      });
      await reload();
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const addGift = async () => {
    if (!giftName || !giftCost) return;
    setAddingGift(true);
    try {
      await api.addGift({ name: giftName.trim(), emoji: giftEmoji, costPoints: Math.round(Number(giftCost)) });
      setGiftName('');
      setGiftCost('');
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong.');
    } finally {
      setAddingGift(false);
    }
  };

  const removeGift = async (id: string) => {
    await api.removeGift(id);
    await reload();
  };

  return (
    <GradientBackground colors={['#2D1B69', '#8E2DE2', '#FF5DA2']}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>

          <Text style={styles.title}>⚙️ Reward Settings</Text>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>How points are earned</Text>
            <Field
              label="Mark needed to earn a point (above this = +1, at or below = -1)"
              value={threshold}
              onChangeText={setThreshold}
              placeholder="95"
              keyboardType="number-pad"
            />
            <Field
              label="Dollar value per point ($)"
              value={dollarsPerPoint}
              onChangeText={setDollarsPerPoint}
              placeholder="1.00"
              keyboardType="decimal-pad"
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button title={savedFlash ? 'Saved ✓' : 'Save Changes'} onPress={saveSettings} loading={saving} />
          </Card>

          <Text style={styles.sectionTitle}>Gift options</Text>
          {data?.gifts.map((gift) => (
            <Card key={gift.id} style={styles.giftRow}>
              <Text style={styles.giftEmoji}>{gift.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.giftName}>{gift.name}</Text>
                <Text style={styles.giftCost}>{gift.costPoints} points</Text>
              </View>
              <Pressable onPress={() => removeGift(gift.id)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </Pressable>
            </Card>
          ))}

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Add a gift</Text>
            <View style={styles.emojiRow}>
              {EMOJIS.map((e) => (
                <Pressable key={e} onPress={() => setGiftEmoji(e)} style={[styles.emojiChip, giftEmoji === e && styles.emojiChipActive]}>
                  <Text style={styles.emojiText}>{e}</Text>
                </Pressable>
              ))}
            </View>
            <Field label="Gift name" value={giftName} onChangeText={setGiftName} placeholder="Movie night" />
            <Field label="Cost in points" value={giftCost} onChangeText={setGiftCost} placeholder="5" keyboardType="number-pad" />
            <Button title="Add Gift" onPress={addGift} loading={addingGift} disabled={!giftName || !giftCost} variant="gold" />
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 48 },
  back: { marginBottom: 8 },
  backText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  title: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 16 },
  card: { marginBottom: 18 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: colors.text, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#fff', marginBottom: 10 },
  error: { color: colors.danger, backgroundColor: colors.cardAlt, padding: 10, borderRadius: 10, marginBottom: 10, fontWeight: '600' },
  giftRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, paddingVertical: 14 },
  giftEmoji: { fontSize: 28 },
  giftName: { fontSize: 15, fontWeight: '800', color: colors.text },
  giftCost: { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  removeButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFE3E3', borderRadius: 10 },
  removeButtonText: { color: colors.danger, fontWeight: '800', fontSize: 12 },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  emojiChip: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardAlt, borderWidth: 2, borderColor: 'transparent' },
  emojiChipActive: { borderColor: colors.primary, backgroundColor: '#EDE0FF' },
  emojiText: { fontSize: 18 },
});
