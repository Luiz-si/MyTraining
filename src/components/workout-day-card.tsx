import { Pressable, StyleSheet, Text, View } from 'react-native';

import { styles } from '@/components/workout-screen';
import type { WorkoutDay } from '@/data/workouts';

export function WorkoutDayCard({ day, position, onPress }: {
  day: WorkoutDay;
  position: number;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${day.name}: ${day.muscles.join(', ')}`}
      accessibilityHint="Abre os exercícios deste dia"
      onPress={onPress} style={({ pressed }) => [styles.card, local.card, pressed && styles.pressed]}>
      <View style={local.heading}>
        <Text style={styles.eyebrow}>DIA {String(position).padStart(2, '0')}</Text>
        <Text style={styles.accent} accessibilityElementsHidden importantForAccessibility="no">↗</Text>
      </View>
      <Text style={styles.sectionTitle}>{day.name}</Text>
      <Text style={styles.description}>{day.muscles.join(' · ')}</Text>
      <Text style={local.link}>Ver exercícios →</Text>
    </Pressable>
  );
}

const local = StyleSheet.create({
  card: { gap: 10 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  link: { color: '#B0F36D', fontWeight: '600', fontSize: 13, marginTop: 6 },
});
