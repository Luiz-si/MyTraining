import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { WorkoutDayCard } from '@/components/workout-day-card';
import { Button, Screen, styles } from '@/components/workout-screen';
import { restDay, weeklySplit } from '@/data/workouts';

export default function WeeklySplitScreen() {
  return (
    <Screen>
      <Button label=" Voltar ao início" onPress={() => router.dismissTo('/perfil')} secondary />
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>ROTINA DO CRIADOR</Text>
        <Text accessibilityRole="header" style={styles.hero}>Minha divisão semanal</Text>
        <Text style={styles.description}>Seis dias de treino, um dia de descanso. Selecione um dia para conhecer a sessão.</Text>
      </View>
      {weeklySplit.map((day, index) => (
        <WorkoutDayCard key={day.id} day={day} position={index + 1}
          onPress={() => router.push({ pathname: '/dia/[id]', params: { id: day.id } })} />
      ))}
      <View style={styles.note}>
        <Text style={styles.eyebrow}>RECUPERAÇÃO</Text>
        <Text style={styles.sectionTitle}>{restDay.name}</Text>
        <Text style={styles.description}>{restDay.description}</Text>
      </View>
      <Text style={styles.footer}>Cada dia tem seu foco. O descanso também faz parte.</Text>
    </Screen>
  );
}
