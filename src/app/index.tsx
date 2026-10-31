import { workoutColors } from '@/constants/workout-colors';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { HomeEntrance } from '@/components/home-entrance';
import { Button, Screen, styles } from '@/components/workout-screen';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={local.content}>
        <HomeEntrance>
          <View style={local.titleBlock}>
            <View style={local.line} />
            <Text accessibilityRole="header" style={local.title}>MEU<Text style={styles.accent}>TREINO</Text></Text>
          </View>
          <Text style={local.creator}>Desenvolvido por Luiz</Text>
          <View style={local.presentation}>
            <Text style={styles.description}>Bem-vindo ao MeuTreino! Conheça minha rotina de musculação, acompanhe minha divisão semanal e, futuramente, organize seus próprios treinos em um só lugar.</Text>
          </View>
          <View style={local.actions}>
            <Button label="Seu próprio treino" onPress={() => router.push('/seu-treino')} />
            <Button label="Meu perfil e meus treinos" onPress={() => router.push('/perfil')} secondary />
          </View>
        </HomeEntrance>
      </View>
    </Screen>
  );
}

const local = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: 16, paddingVertical: 32 },
  titleBlock: { gap: 24 },
  line: { width: 48, height: 5, borderRadius: 3, backgroundColor: workoutColors.accent },
  title: { fontSize: 36, fontWeight: '900', letterSpacing: -1.5, color: workoutColors.text },
  creator: { color: workoutColors.accent, fontSize: 14, fontWeight: '600' },
  presentation: { marginTop: 12, marginBottom: 20, borderLeftWidth: 2, borderLeftColor: workoutColors.border, paddingLeft: 16 },
  actions: { gap: 14 },
});