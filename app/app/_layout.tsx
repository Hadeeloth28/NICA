import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { AuthProvider } from '../lib/auth-context';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
