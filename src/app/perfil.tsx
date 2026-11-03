/**
 * TELA DO PERFIL DO CRIADOR
 * Onde aparece: Meu perfil e meus treinos.
 * Edite aqui: posição da foto, nome, botão Minha proposta e acesso aos treinos.
 * Nome e imagem vêm de src/data/perfil-criador.ts; a aparência está em local, no fim.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { workoutColors } from '@/constants/cores-app';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button, Screen, styles } from '@/components/tela-base';
import { creator } from '@/data/perfil-criador';
import { weeklySplit } from '@/data/divisao-semanal';
import { AboutEntry } from '@/features/minha-proposta/botao-minha-proposta';
import { ExportRoutineButton } from '@/features/exercicios/botao-exportar-rotina';

export default function HomeScreen() {
  return (
    <Screen>
      <Button label="Página principal" onPress={() => router.dismissTo('/')} secondary />
      <Text style={styles.brand}>Meu<Text style={styles.accent}>Treino</Text></Text>
      {/* PERFIL: foto, identificação do criador e botão Minha proposta. */}
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
          <AboutEntry />
        </View>
      </View>
      {/* ROTINA: apresentação da semana, quantidades e botão para abrir os dias. */}
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

// APARÊNCIA SÓ DESTA TELA: tamanho da foto, bordas e espaço entre os dados do perfil.
const local = StyleSheet.create({
  profile: { borderTopColor: workoutColors.accent, gap: 22 },
  photo: { width: 140, height: 140, borderRadius: 32, borderWidth: 1, borderColor: workoutColors.borderStrong },
  placeholder: { backgroundColor: workoutColors.selected, alignItems: 'center', justifyContent: 'center', gap: 8 },
  initial: { color: workoutColors.accent, fontSize: 44, fontWeight: '800' },
  photoLabel: { color: workoutColors.accent, fontSize: 9, letterSpacing: 1 },
  identity: { gap: 12 },
});
