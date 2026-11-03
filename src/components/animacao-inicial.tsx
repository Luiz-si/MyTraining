/**
 * ANIMAÇÃO DA TELA INICIAL
 * Mostra os primeiros blocos com uma entrada curta e progressiva.
 * Respeita a preferência de redução de movimento do celular.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { Children, type PropsWithChildren, useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

// Os quatro blocos entram em sequência, em menos de um segundo.
export function HomeEntrance({ children }: PropsWithChildren) {
  const [values] = useState(() => Array.from({ length: 4 }, () => new Animated.Value(0)));

  useEffect(() => {
    let active = true;
    let preferenceChanged = false;
    let animation: Animated.CompositeAnimation | undefined;

    function show(reduceMotion: boolean) {
      if (!active) return;
      animation?.stop();
      if (reduceMotion) {
        values.forEach((value) => value.setValue(1));
        return;
      }
      animation = Animated.stagger(110, values.map((value) => Animated.timing(value, {
        toValue: 1,
        duration: 330,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })));
      animation.start();
    }

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      preferenceChanged = true;
      show(enabled);
    });
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!preferenceChanged) show(enabled);
    }).catch(() => show(true));

    return () => {
      active = false;
      animation?.stop();
      subscription.remove();
    };
  }, [values]);

  return Children.map(children, (child, index) => {
    const progress = values[index];
    if (!progress) return child;
    return (
      <Animated.View style={{ opacity: progress, transform: [{ translateY: progress.interpolate({
        inputRange: [0, 1], outputRange: [12, 0],
      }) }] }}>
        {child}
      </Animated.View>
    );
  });
}
