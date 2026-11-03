/**
 * PREFERÊNCIA DE TEMA NA VERSÃO WEB
 * Adapta o tema ao navegador sem divergência na primeira renderização.
 * O sufixo .web faz este arquivo ser escolhido ao executar na web.
 * Guia de localização: docs/onde-mexer-no-codigo.md
 */

import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
