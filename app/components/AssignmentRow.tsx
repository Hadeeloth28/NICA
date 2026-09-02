import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Assignment } from '../lib/api';
import { colors, radius } from '../lib/theme';

const STATUS_META: Record<Assignment['status'], { label: string; bg: string; fg: string }> = {
  pending: { label: 'Waiting for approval', bg: '#FFF4D6', fg: '#B8860B' },
  approved: { label: 'Approved', bg: '#DFF9EF', fg: '#00875A' },
  rejected: { label: 'Rejected', bg: '#FFE3E3', fg: '#C0392B' },
};

export function AssignmentRow({ assignment, kidName }: { assignment: Assignment; kidName?: string }) {
  const meta = STATUS_META[assignment.status];
  const points = assignment.pointsAwarded;

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {assignment.title}
        </Text>
        <Text style={styles.subject}>
          {assignment.subject}
          {kidName ? ` • ${kidName}` : ''} • {assignment.mark}/100
        </Text>
        <View style={[styles.badge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.badgeText, { color: meta.fg }]}>{meta.label}</Text>
        </View>
      </View>
      {points !== null && points !== undefined && (
        <Text style={[styles.points, points > 0 ? styles.pointsUp : styles.pointsDown]}>
          {points > 0 ? `+${points}` : points}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  info: { flex: 1, paddingRight: 12 },
  title: { fontSize: 16, fontWeight: '800', color: colors.text },
  subject: { fontSize: 13, color: colors.textMuted, marginTop: 2, fontWeight: '600' },
  badge: { alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
  badgeText: { fontSize: 11, fontWeight: '800' },
  points: { fontSize: 22, fontWeight: '900' },
  pointsUp: { color: colors.success },
  pointsDown: { color: colors.danger },
});
