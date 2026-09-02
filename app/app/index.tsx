import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GradientBackground } from '../components/GradientBackground';
import { useAuth } from '../lib/auth-context';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <GradientBackground>
        <View style={styles.center}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      </GradientBackground>
    );
  }

  if (!user) return <Redirect href="/welcome" />;
  return <Redirect href={user.role === 'parent' ? '/parent' : '/kid'} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
