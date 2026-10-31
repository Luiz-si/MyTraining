import { useAudioPlayer } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';

export default function RestTimer() {
  const player = useAudioPlayer(require('../../assets/sounds/fim-descanso.mp3'));
  const [seconds, setSeconds] = useState(180);
  const minutes = Math.floor(seconds / 60);
  const [running, setRunning] = useState(false);
  const remainingSeconds = seconds % 60;
  const displayTime = `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
    useEffect(() => {
    if (!running) {
      return;
    }

    if (seconds === 0) {
      player.seekTo(0);
      player.play();
      return;
    }

    const timeout = setTimeout(() => {
      setSeconds((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [running, seconds, player]);


  return (
    <Pressable
      onPress={() => {
        setSeconds(180);
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
      <Text>{displayTime}</Text>
    </Pressable>
  );
}
