import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';

export function PointsCounter({
  points,
  dollars,
  label = 'points',
}: {
  points: number;
  dollars?: string;
  label?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const [prevPoints, setPrevPoints] = useState(points);

  useEffect(() => {
    if (points !== prevPoints) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
      setPrevPoints(points);
    }
  }, [points, prevPoints, scale]);

  const isPositive = points >= 0;

  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{isPositive ? '⭐' : '💤'}</Text>
      <Animated.Text style={[styles.number, { transform: [{ scale }] }, !isPositive && styles.numberNegative]}>
        {points}
      </Animated.Text>
      <Text style={styles.label}>{label}</Text>
      {dollars !== undefined && <Text style={styles.dollars}>worth {dollars}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 36, marginBottom: 4 },
  number: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
  },
  numberNegative: {
    color: '#FFD1D1',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 2,
  },
  dollars: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gold,
    marginTop: 6,
  },
});
