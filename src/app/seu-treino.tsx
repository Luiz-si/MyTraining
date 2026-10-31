import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, Screen, styles } from '@/components/workout-screen';

export default function PersonalWorkoutScreen() {
  return (
    <Screen>
      <Text style={styles.brand}>Meu<Text style={styles.accent}>Treino</Text></Text>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>SEU PRÓPRIO TREINO</Text>
        <Text accessibilityRole="header" style={styles.title}>Sua rotina, do seu jeito.</Text>
        <Text style={styles.description}>Em breve, você poderá criar e personalizar seus próprios treinos!</Text>
      </View>
      <Button label="Voltar à página principal" onPress={() => router.dismissTo('/')} secondary />
    </Screen>
  );
}
