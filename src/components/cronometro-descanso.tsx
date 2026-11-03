/**
 * CONTADOR E SOM DO DESCANSO
 * Edite aqui: duração, aparência do botão e áudio ao terminar.
 * O prazo é calculado pelo horário de término, não apenas pela quantidade de atualizações.
 * Notificação e som garantido em segundo plano ainda não estão implementados.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { workoutColors } from '@/constants/cores-app';
import { useAudioPlayer } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';

export default function RestTimer() {
  // ÁUDIO: o caminho abaixo escolhe o arquivo que será tocado ao terminar.
  const player = useAudioPlayer(require('../../assets/sounds/fim-descanso.mp3'));
  const [seconds, setSeconds] = useState(180);
  const minutes = Math.floor(seconds / 60);
  const [running, setRunning] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const remainingSeconds = seconds % 60;
  const displayTime = `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  // CONTAGEM: calcula os segundos restantes comparando o prazo com o horário atual.
    useEffect(() => {
    if (!running || endTime === null) {
      return;
    }

    if (seconds === 0) {
      player.seekTo(0);
      player.play();
      return;
    }

    const timeout = setTimeout(() => {
      setSeconds(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [running, seconds, player, endTime]);


  return (
    // BOTÃO: o toque reinicia os três minutos; o style abaixo define tamanho e cor.
    <Pressable
      onPress={() => {
        setSeconds(180);
        setEndTime(Date.now() + 180 * 1000);
        setRunning(true);
        }}  
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#00ff22',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: workoutColors.onAccent, fontWeight: '700' }}>{displayTime}</Text>
    </Pressable>
  );
}
