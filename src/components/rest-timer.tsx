import { workoutColors } from '@/constants/workout-colors';
import { useAudioPlayer } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';

export default function RestTimer() {
  const player = useAudioPlayer(require('../../assets/sounds/fim-descanso.mp3'));
  const [seconds, setSeconds] = useState(180);
  const minutes = Math.floor(seconds / 60);
  const [running, setRunning] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const remainingSeconds = seconds % 60;
  const displayTime = `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
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
