import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from './context/AuthContext';
import { ChecklistProvider } from './context/ChecklistContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <ChecklistProvider>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="cadastro" options={{ headerShown: false }} />
          <Stack.Screen name="recuperar-senha" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="cliente-detalhes" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist-veiculo" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist-placa" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist-dados" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist-foto" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist-avarias" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist-foto-traseira" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist-avarias-traseira" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist-foto-lateral-direita" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist-avarias-lateral-direita" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist-foto-lateral-esquerda" options={{ headerShown: false }} />
          <Stack.Screen name="novo-checklist-avarias-lateral-esquerda" options={{ headerShown: false }} />
          <Stack.Screen name= "novo-checklist-foto-maleiro" options={{ headerShown: false }} />
          <Stack.Screen name= "novo-checklist-avarias-maleiro" options={{ headerShown: false }} />
          <Stack.Screen name= "novo-checklist-foto-odometro" options={{ headerShown: false }} />
          <Stack.Screen name= "novo-checklist-avarias-interior" options={{ headerShown: false }} />
          <Stack.Screen name= "novo-checklist-final" options={{ headerShown: false }} />
          <Stack.Screen name= "novo-checklist-assinatura" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
        </ChecklistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
