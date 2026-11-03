/**
 * TELA DOS EXERCÍCIOS DE UM DIA
 * O mesmo arquivo atende segunda, terça e os outros dias, usando o parâmetro id.
 * Edite aqui: cabeçalho do dia e posição do contador de descanso.
 * A lista vem de features/exercicios/lista-exercicios-dia.tsx.
 * O nome [id].tsx é uma rota dinâmica do Expo Router: mantenha-o.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import RestTimer from '@/components/cronometro-descanso';
import { Button, Screen, styles } from '@/components/tela-base';
import { DayExercises } from '@/features/exercicios/lista-exercicios-dia';
import { useWeeklySplit } from '@/features/divisao-semanal/use-divisao-semanal';

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
