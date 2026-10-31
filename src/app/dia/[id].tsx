import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import RestTimer from '@/components/rest-timer';
import { Button, Screen, styles } from '@/components/workout-screen';
import { DayExercises } from '@/features/exercises/day-exercises';
import { useWeeklySplit } from '@/features/workouts/use-weekly-split';

export default function DayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { days } = useWeeklySplit();
  const day = days.find((item) => item.id === id);
  const backButton = <Button label=" Voltar à divisão semanal" onPress={() => router.dismissTo('/treino')} secondary />;

  if (!day) {
    return (
      <Screen>
        {backButton}
        <Text accessibilityRole="header" style={styles.title}>Dia não encontrado</Text>
        <Text style={styles.description}>Escolha um dos dias na divisão semanal.</Text>
      </Screen>
    );
  }

  return (
    <Screen keyboardShouldPersistTaps="handled">
      {backButton}
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>MINHA DIVISÃO SEMANAL</Text>
        <Text accessibilityRole="header" style={styles.hero}>{day.name}</Text>
        <Text style={styles.description}>{day.muscles.join(' · ')}</Text>
      </View>
      <RestTimer />
      <Text accessibilityRole="header" style={styles.sectionTitle}>Exercícios</Text>
      <DayExercises key={day.id} dayId={day.id} />
    </Screen>
  );
}
