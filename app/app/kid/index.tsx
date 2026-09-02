import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AssignmentRow } from '../../components/AssignmentRow';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { GradientBackground } from '../../components/GradientBackground';
import { PointsCounter } from '../../components/PointsCounter';
import { api, Assignment } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { dollarsFromPoints, useFamily } from '../../lib/use-family';

export default function KidDashboard() {
  const { user, signOut } = useAuth();
  const { data, loading, reload } = useFamily();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAssignments = useCallback(async () => {
    const rows = await api.listAssignments();
    setAssignments(rows);
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([reload(), loadAssignments()]);
    setRefreshing(false);
  };

  const me = data?.kids.find((k) => k.id === user?.id);
  const points = me?.points ?? 0;
  const pointValueCents = data?.settings.pointValueCents ?? 100;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.hello}>Hey {user?.name?.split(' ')[0]} {user?.avatar}</Text>
              <Text style={styles.hint}>Keep those marks up 🔥</Text>
            </View>
            <Pressable onPress={signOut} style={styles.logout}>
              <Text style={styles.logoutText}>Log out</Text>
            </Pressable>
          </View>

          <View style={styles.counterWrap}>
            <PointsCounter points={points} dollars={dollarsFromPoints(points, pointValueCents)} />
          </View>

          <View style={styles.actionRow}>
            <Button title="Log an Assignment ✏️" onPress={() => router.push('/kid/add')} style={styles.grow} />
          </View>
          <View style={styles.actionRow}>
            <Button
              title="Redeem Points 🎁"
              onPress={() => router.push('/kid/redeem')}
              variant="gold"
              disabled={points <= 0}
              style={styles.grow}
            />
          </View>

          <Text style={styles.sectionTitle}>Your assignments</Text>

          {assignments.length === 0 && !loading ? (
            <Text style={styles.empty}>Nothing logged yet — add your first assignment above!</Text>
          ) : (
            <Card style={styles.assignmentsCard}>
              {assignments.map((item) => (
                <AssignmentRow key={item.id} assignment={item} />
              ))}
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  hello: { fontSize: 22, fontWeight: '900', color: '#fff' },
  hint: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 2 },
  logout: { paddingHorizontal: 12, paddingVertical: 8 },
  logoutText: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 13 },
  counterWrap: { alignItems: 'center', marginVertical: 24 },
  actionRow: { marginBottom: 10 },
  grow: { width: '100%' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#fff', marginTop: 20, marginBottom: 8 },
  empty: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 8 },
  assignmentsCard: { paddingVertical: 4 },
});
