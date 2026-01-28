import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { UserProvider, useUser } from './context/UserContext';
import { View, ActivityIndicator } from 'react-native';

// Componente wrapper para manejar la lógica de navegación
function RootLayoutNav() {
  const { profile, isLoading } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // ¿En qué grupo de pantallas está el usuario?
    const inTabsGroup = segments[0] === '(tabs)';

    if (!profile.isOnboarded && inTabsGroup) {
      // SI NO TIENE PERFIL -> Mandar a Onboarding
      router.replace('/onboarding');
    } else if (profile.isOnboarded && segments[0] === 'onboarding') {
      // SI YA TIENE PERFIL -> Mandar a Tabs (por si quiere volver atrás)
      router.replace('/(tabs)');
    }
  }, [profile.isOnboarded, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
    </Stack>
  );
}

// Layout Principal
export default function RootLayout() {
  return (
    <UserProvider>
      <RootLayoutNav />
    </UserProvider>
  );
}