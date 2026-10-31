import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button, Screen, styles } from '@/components/workout-screen';
import { creator } from '@/data/creator';
import { weeklySplit } from '@/data/workouts';
import { ExportRoutineButton } from '@/features/exercises/export-routine-button';

export default function HomeScreen() {
  return (
    <Screen>
      <Text style={styles.brand}>Meu<Text style={styles.accent}>Treino</Text></Text>
      <View style={[styles.card, local.profile]}>
        <Text style={styles.eyebrow}>POR TRÁS DO MEUTREINO</Text>
        {creator.photo ? (
          <Image source={creator.photo} accessibilityLabel={`Foto de ${creator.name}`} style={local.photo} />
        ) : (
          <View style={[local.photo, local.placeholder]} accessibilityLabel="Espaço reservado para a foto do criador">
            <Text style={local.initial}>{creator.name.trim().charAt(0).toUpperCase() || 'M'}</Text>
            <Text style={local.photoLabel}>SUA FOTO AQUI</Text>
          </View>
        )}
        <View style={local.identity}>
          <Text style={styles.eyebrow}>Criador do MeuTreino</Text>
          <Text accessibilityRole="header" style={styles.hero}>{creator.name}</Text>
          <Text style={styles.description}>{creator.description}</Text>
        </View>
      </View>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>MINHA ROTINA</Text>
        <Text accessibilityRole="header" style={styles.title}>Uma semana de dedicação.</Text>
        <Text style={styles.description}>Minha divisão de musculação, organizada dia a dia. Conheça os grupos musculares de cada sessão.</Text>
      </View>
      <View style={styles.stats}>
        <View><Text style={styles.statValue}>{weeklySplit.length}</Text><Text style={styles.description}>dias de treino</Text></View>
        <View><Text style={styles.statValue}>1</Text><Text style={styles.description}>dia de descanso</Text></View>
      </View>
      <Button label="Iniciar treino" onPress={() => router.push('/treino')} />
      <ExportRoutineButton />
      <Text style={styles.footer}>A rotina do criador. A identidade do MeuTreino.</Text>
    </Screen>
  );
}

const local = StyleSheet.create({
  profile: { borderTopColor: '#B0F36D', gap: 22 },
  photo: { width: 140, height: 140, borderRadius: 32, borderWidth: 1, borderColor: '#48613A' },
  placeholder: { backgroundColor: '#25351F', alignItems: 'center', justifyContent: 'center', gap: 8 },
  initial: { color: '#B0F36D', fontSize: 44, fontWeight: '800' },
  photoLabel: { color: '#B0F36D', fontSize: 9, letterSpacing: 1 },
  identity: { gap: 12 },
});
