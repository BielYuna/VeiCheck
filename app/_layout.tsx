import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { ChecklistProvider } from './context/ChecklistContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ChecklistProvider>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="cliente-detalhes" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist-veiculo" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist-placa" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist-dados" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ChecklistProvider>
    </ThemeProvider>
  );
}
