import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, gradients, radius } from '../lib/theme';

type Variant = 'primary' | 'success' | 'danger' | 'ghost' | 'gold';

const VARIANT_GRADIENTS: Record<Exclude<Variant, 'ghost'>, readonly [string, string, ...string[]]> = {
  primary: gradients.card,
  success: gradients.success,
  danger: gradients.danger,
  gold: gradients.gold,
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  icon,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: string;
}) {
  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const label = (
    <Text style={[styles.label, variant === 'ghost' && styles.ghostLabel]}>
      {icon ? `${icon}  ` : ''}
      {loading ? '' : title}
      {loading && <ActivityIndicator color={variant === 'ghost' ? colors.primary : '#fff'} />}
    </Text>
  );

  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [styles.ghost, style, pressed && styles.pressed, disabled && styles.disabled]}
      >
        {label}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress} disabled={disabled || loading} style={({ pressed }) => [pressed && styles.pressed, disabled && styles.disabled]}>
      <LinearGradient colors={VARIANT_GRADIENTS[variant]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.button, style]}>
        {label}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  label: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  ghostLabel: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
