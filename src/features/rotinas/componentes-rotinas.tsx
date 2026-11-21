/**
 * PEÇAS VISUAIS DAS ROTINAS: cartões, botões discretos e janela de edição.
 * Cores, bordas e espaçamentos específicos desta área ficam em estilos-rotinas.ts.
 * O banco nunca é alterado por um cartão: ele chama as funções recebidas da tela.
 */
import type { PropsWithChildren } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '@/components/tela-base';
import { workoutColors as colors } from '@/constants/cores-app';
import { routineModels } from '@/data/modelos-rotinas';
import type { PersonalRoutine } from './tipos-rotina';
import { routineStyles as local } from './estilos-rotinas';

export function SmallAction({ label, onPress, disabled = false, danger = false, accessibilityLabel }: { label: string; onPress: () => void; disabled?: boolean; danger?: boolean; accessibilityLabel?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [local.action, (pressed || disabled) && styles.pressed]}>
    <Text style={[local.actionText, danger && local.error]}>{label}</Text>
  </Pressable>;
}

export function RoutineCard({ routine, onOpen, onMenu }: { routine: PersonalRoutine; onOpen: () => void; onMenu: () => void }) {
  const days = routine.days.filter((day) => !day.rest);
  const groups = [...new Set(days.flatMap((day) => day.muscles))];
  return <View style={[local.card, local.greenCard]}>
    <View style={local.row}>
      <Text style={local.badge}>{days.length} DIAS DE TREINO</Text>
      <SmallAction label="⋯" accessibilityLabel={`Opções de ${routine.name}`} onPress={onMenu} />
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${routine.name}`} onPress={onOpen} style={({ pressed }) => [local.stack, pressed && styles.pressed]}>
      <Text style={styles.sectionTitle}>{routine.name}</Text>
      <Text style={local.caption}>{routineModels.find((model) => model.id === routine.modelId)?.name ?? 'Personalizado'} · {days.length} dias</Text>
      <Text style={styles.description}>{groups.join(' · ') || 'Escolha os dias e grupos musculares'}</Text>
      <Text style={local.actionText}>Abrir rotina →</Text>
    </Pressable>
  </View>;
}

export function RoutineSheet({ title, onClose, busy = false, children, contentKey }: PropsWithChildren<{ title: string; onClose: () => void; busy?: boolean; contentKey?: string }>) {
  return <Modal transparent visible animationType="fade" onRequestClose={() => { if (!busy) onClose(); }}>
    <SafeAreaView style={local.backdrop}>
      <KeyboardAvoidingView style={local.modalWidth} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={local.panel} accessibilityViewIsModal>
          <View style={local.row}>
            <Text accessibilityRole="header" style={[styles.sectionTitle, local.flex]}>{title}</Text>
            <SmallAction label="Fechar" onPress={onClose} disabled={busy} />
          </View>
          {/* Ao trocar de modelo, reinicia a rolagem para mostrar o nome e as ações no topo. */}
          <ScrollView key={contentKey} keyboardShouldPersistTaps="handled" contentContainerStyle={local.stack}>{children}</ScrollView>
          {busy && <ActivityIndicator color={colors.accent} accessibilityLabel="Salvando rotina" />}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}
