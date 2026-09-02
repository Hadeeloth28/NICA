import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { GradientBackground } from '../../components/GradientBackground';
import { api, Assignment, Redemption } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { dollarsFromPoints, useFamily } from '../../lib/use-family';
import { colors, radius } from '../../lib/theme';

export default function ParentDashboard() {
  const { user, signOut } = useAuth();
  const { data, loading, reload } = useFamily();
  const [pending, setPending] = useState<Assignment[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [p, r] = await Promise.all([api.pendingAssignments(), api.listRedemptions()]);
    setPending(p);
    setRedemptions(r.filter((x) => x.status === 'requested'));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([reload(), loadAll()]);
    setRefreshing(false);
  };

  const decideAssignment = async (id: string, decision: 'approve' | 'reject') => {
    setBusyId(id);
    try {
      await api.decideAssignment(id, decision);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Promise.all([reload(), loadAll()]);
    } finally {
      setBusyId(null);
    }
  };

  const decideRedemption = async (id: string, decision: 'fulfill' | 'decline') => {
    setBusyId(id);
    try {
      await api.decideRedemption(id, decision);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Promise.all([reload(), loadAll()]);
    } finally {
      setBusyId(null);
    }
  };

  const pointValueCents = data?.settings.pointValueCents ?? 100;

  return (
    <GradientBackground colors={['#2D1B69', '#8E2DE2', '#FF5DA2']}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.hello}>Hi {user?.name} {user?.avatar}</Text>
              <Text style={styles.hint}>{data?.family.name}</Text>
            </View>
            <Pressable onPress={signOut} style={styles.logout}>
              <Text style={styles.logoutText}>Log out</Text>
            </Pressable>
          </View>

          {data?.family.inviteCode && (
            <Card style={styles.inviteCard}>
              <Text style={styles.inviteLabel}>Invite code for your kid</Text>
              <Text style={styles.inviteCode}>{data.family.inviteCode}</Text>
            </Card>
          )}

          <View style={styles.kidsRow}>
            {data?.kids.map((kid) => (
              <Card key={kid.id} style={styles.kidCard}>
                <Text style={styles.kidAvatar}>{kid.avatar}</Text>
                <Text style={styles.kidName}>{kid.name}</Text>
                <Text style={styles.kidPoints}>{kid.points} pts</Text>
                <Text style={styles.kidDollars}>{dollarsFromPoints(kid.points, pointValueCents)}</Text>
              </Card>
            ))}
            {data && data.kids.length === 0 && !loading && (
              <Text style={styles.empty}>No kids have joined yet — share your invite code above.</Text>
            )}
          </View>

          <Button title="Reward Settings ⚙️" onPress={() => router.push('/parent/settings')} variant="ghost" style={styles.settingsButton} />

          <Text style={styles.sectionTitle}>📋 Needs your approval ({pending.length})</Text>
          {pending.length === 0 ? (
            <Text style={styles.empty}>All caught up — nothing waiting.</Text>
          ) : (
            pending.map((a) => {
              const kid = data?.kids.find((k) => k.id === a.kidId);
              const willEarn = a.mark > (data?.settings.threshold ?? 95) ? '+1' : '-1';
              return (
                <Card key={a.id} style={styles.requestCard}>
                  <Text style={styles.requestTitle}>{a.title}</Text>
                  <Text style={styles.requestMeta}>
                    {a.subject} • {kid?.name ?? 'Kid'} • Mark: {a.mark}/100 •{' '}
                    <Text style={willEarn.startsWith('+') ? styles.pointsUp : styles.pointsDown}>{willEarn} point</Text>
                  </Text>
                  <View style={styles.requestActions}>
                    <Button
                      title="Reject"
                      onPress={() => decideAssignment(a.id, 'reject')}
                      variant="danger"
                      loading={busyId === a.id}
                      style={styles.requestButton}
                    />
                    <Button
                      title="Approve"
                      onPress={() => decideAssignment(a.id, 'approve')}
                      variant="success"
                      loading={busyId === a.id}
                      style={styles.requestButton}
                    />
                  </View>
                </Card>
              );
            })
          )}

          <Text style={styles.sectionTitle}>🎁 Redemption requests ({redemptions.length})</Text>
          {redemptions.length === 0 ? (
            <Text style={styles.empty}>No pending redemptions.</Text>
          ) : (
            redemptions.map((r) => {
              const kid = data?.kids.find((k) => k.id === r.kidId);
              return (
                <Card key={r.id} style={styles.requestCard}>
                  <Text style={styles.requestTitle}>{r.label}</Text>
                  <Text style={styles.requestMeta}>
                    {kid?.name ?? 'Kid'} • {r.pointsSpent} points
                  </Text>
                  <View style={styles.requestActions}>
                    <Button
                      title="Decline"
                      onPress={() => decideRedemption(r.id, 'decline')}
                      variant="danger"
                      loading={busyId === r.id}
                      style={styles.requestButton}
                    />
                    <Button
                      title="Fulfill"
                      onPress={() => decideRedemption(r.id, 'fulfill')}
                      variant="gold"
                      loading={busyId === r.id}
                      style={styles.requestButton}
                    />
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hello: { fontSize: 20, fontWeight: '900', color: '#fff' },
  hint: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 2 },
  logout: { paddingHorizontal: 12, paddingVertical: 8 },
  logoutText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 13 },
  inviteCard: { marginTop: 16, alignItems: 'center' },
  inviteLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  inviteCode: { fontSize: 28, fontWeight: '900', color: colors.primary, letterSpacing: 4, marginTop: 4 },
  kidsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  kidCard: { flexBasis: '47%', alignItems: 'center', paddingVertical: 18 },
  kidAvatar: { fontSize: 34 },
  kidName: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 6 },
  kidPoints: { fontSize: 22, fontWeight: '900', color: colors.primary, marginTop: 4 },
  kidDollars: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginTop: 2 },
  settingsButton: { marginTop: 18, borderColor: 'rgba(255,255,255,0.6)' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#fff', marginTop: 22, marginBottom: 10 },
  empty: { color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  requestCard: { marginBottom: 10 },
  requestTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  requestMeta: { fontSize: 13, color: colors.textMuted, fontWeight: '600', marginTop: 4 },
  pointsUp: { color: colors.success, fontWeight: '800' },
  pointsDown: { color: colors.danger, fontWeight: '800' },
  requestActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  requestButton: { flex: 1, paddingVertical: 12 },
});
