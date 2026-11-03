/**
 * NAVEGAÇÃO DO APLICATIVO
 * Configura quais telas existem, o tema de navegação e a abertura do app.
 * Os conteúdos de cada tela ficam nos outros arquivos de src/app.
 * O nome _layout.tsx é especial para o Expo Router: mantenha-o.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { workoutColors } from '@/constants/cores-app';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { View } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: workoutColors.background }} onLayout={() => {
        SplashScreen.hideAsync().catch(() => {});
      }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: workoutColors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="perfil" />
        <Stack.Screen name="sobre-meutreino" />
        <Stack.Screen name="seu-treino" />
        <Stack.Screen name="treino" />
        <Stack.Screen name="dia/[id]" />
      </Stack>
      </View>
    </ThemeProvider>
  );
}
