import { workoutColors } from '@/constants/workout-colors';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { styles } from '@/components/workout-screen';
import type { WorkoutDay } from '@/data/workouts';

export function WorkoutDayCard({ day, position, onPress, onEdit }: {
  day: WorkoutDay;
  position: number;
  onPress: () => void;
  onEdit?: () => void;
}) {
    return (
    <View style={[styles.card, local.card]}>
      <View style={local.heading}>
        <Text style={styles.eyebrow}>
          DIA {String(position).padStart(2, '0')}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar grupos de ${day.name}`}
          onPress={onEdit}
          style={({ pressed }) => [
            {
              backgroundColor: '#25351F',
              borderColor: '#B0F36D',
              borderWidth: 2,
              borderRadius: 12,
              paddingHorizontal: 16,
              
              minHeight: 0,
              minWidth: 48,
              alignItems: 'center',
              justifyContent: 'center',
            },
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.accent}>Editar</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${day.name}: ${day.muscles.join(', ')}`}
        accessibilityHint="Abre os exercícios deste dia"
        onPress={onPress}
        style={({ pressed }) => [
          local.card,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.sectionTitle}>{day.name}</Text>
        <Text style={styles.description}>
          {day.muscles.join(' · ')}
        </Text>
        <Text style={local.link}>Ver exercícios →</Text>
      </Pressable>
    </View>
  );
}

const local = StyleSheet.create({
  card: { gap: 10 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  link: { 
    color: workoutColors.accent,
    fontWeight: '600',
    fontSize: 13,
    marginTop: 6,
    backgroundColor: '#25351F',
    borderColor: '#B0F36D',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  }, 
});
