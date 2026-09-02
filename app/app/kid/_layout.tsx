import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useAuth } from '../../lib/auth-context';

export default function KidLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect href="/welcome" />;
  if (user.role !== 'kid') return <Redirect href="/parent" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
