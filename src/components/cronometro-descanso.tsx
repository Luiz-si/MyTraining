/**
 * BOTÃO DE DESCANSO: aparência, áudio e conexão com o relógio do celular.
 * Regras da contagem: features/descanso/controle-cronometro.ts.
 * Não agenda notificações nem garante som com o aplicativo suspenso.
 */
import { useAudioPlayer } from 'expo-audio';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';

import { workoutColors as colors } from '@/constants/cores-app';
import { createRestTimer, REST_SECONDS, type RestState } from '@/features/descanso/controle-cronometro';

export default function RestTimer() {
  // ÁUDIO: este caminho escolhe o aviso de finalização.
  const player = useAudioPlayer(require('../../assets/sounds/fim-descanso.mp3'));
  const controller = useRef<ReturnType<typeof createRestTimer> | null>(null);
  const [state, setState] = useState<RestState>({ seconds: REST_SECONDS, running: false, completed: false });
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    const timer = createRestTimer({
      onChange: setState,
      onComplete: (isCurrent) => {
        // Um novo toque invalida um aviso que ainda aguarda o seekTo.
        void (async () => {
          try {
            await player.seekTo(0);
            if (isCurrent()) player.play();
          } catch {
            if (isCurrent()) setAudioError(true);
          }
        })();
      },
    });
    controller.current = timer;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') timer.refresh();
    });
    return () => {
      controller.current = null;
      subscription.remove();
      timer.dispose();
      player.pause();
    };
  }, [player]);

  const displayTime = `${String(Math.floor(state.seconds / 60)).padStart(2, '0')}:${String(state.seconds % 60).padStart(2, '0')}`;
  const title = state.running ? 'Descanso em andamento' : 'Iniciar descanso';
  const hint = state.running ? 'Toque para reiniciar os 3 minutos' : state.completed ? 'Descanso concluído · Pronto para o próximo' : '3 minutos para recuperar';

  return (
    <View style={local.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${displayTime}`}
        accessibilityHint="Inicia ou reinicia um descanso de três minutos"
        onPress={() => {
          player.pause();
          setAudioError(false);
          controller.current?.start();
        }}
        style={({ pressed }) => [local.button, state.running && local.active, pressed && local.pressed]}
      >
        <View style={local.heading}>
          <View style={local.icon}>
            <SymbolView name={{ ios: 'timer', android: 'timer', web: 'timer' }} size={22} tintColor={colors.accent} />
          </View>
          <View style={local.copy}>
            <Text style={local.title}>{title}</Text>
            <Text style={local.hint}>{hint}</Text>
          </View>
          {state.running && <Animated.View entering={FadeIn.duration(180).reduceMotion(ReduceMotion.System)} style={local.dot} />}
        </View>
        <Text style={local.time}>{displayTime}</Text>
      </Pressable>
      {audioError && <Text accessibilityRole="alert" style={local.error}>Descanso concluído. Não foi possível reproduzir o som.</Text>}
    </View>
  );
}

// VISUAL: cantos, degradê, espaços e tamanho do tempo exibido.
const local = StyleSheet.create({
  container: { gap: 8 },
  button: { padding: 20, borderRadius: 22, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, backgroundImage: 'linear-gradient(135deg, #253F29 0%, #17251C 65%, #171F1B 100%)', gap: 16 },
  active: { borderColor: colors.accent },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#30472B', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 5 },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  hint: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent },
  time: { color: colors.accent, fontSize: 44, lineHeight: 54, fontWeight: '800', fontVariant: ['tabular-nums'], letterSpacing: 1 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  error: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
