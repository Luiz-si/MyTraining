import { DarkTheme, router, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { Pressable, Text, View } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: '#0C100F' }} onLayout={() => {
        SplashScreen.hideAsync().catch(() => {});
      }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0C100F' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="perfil" options={{
          headerShown: true,
          title: '',
          headerStyle: { backgroundColor: '#0C100F' },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable accessibilityRole="button" onPress={() => router.dismissTo('/')}
              style={{ minHeight: 48, justifyContent: 'center', paddingRight: 16 }}>
              <Text style={{ color: '#B0F36D', fontSize: 15 }}>'Página principal'</Text>
            </Pressable>
          ),
        }} />
        <Stack.Screen name="seu-treino" />
        <Stack.Screen name="treino" />
        <Stack.Screen name="dia/[id]" />
      </Stack>
      </View>
    </ThemeProvider>
  );
}
