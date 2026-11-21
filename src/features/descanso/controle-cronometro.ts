/**
 * REGRAS DO DESCANSO, sem dependência de telas ou áudio.
 * O prazo absoluto evita perder segundos quando o celular suspende o JavaScript.
 * O intervalo apenas atualiza a tela; não representa o tempo decorrido.
 */
export const REST_SECONDS = 180;
export type RestState = { seconds: number; running: boolean; completed: boolean };

export function createRestTimer({
  onChange,
  onComplete,
  now = Date.now,
  schedule = (callback: () => void) => {
    const interval = setInterval(callback, 250);
    return () => clearInterval(interval);
  },
}: {
  onChange: (state: RestState) => void;
  onComplete: (isCurrent: () => boolean) => void;
  now?: () => number;
  schedule?: (callback: () => void) => () => void;
}) {
  let deadline: number | null = null;
  let cancel: (() => void) | null = null;
  let generation = 0;
  let disposed = false;
  let seconds = REST_SECONDS;

  function stopInterval() {
    cancel?.();
    cancel = null;
  }

  function refresh() {
    if (disposed || deadline === null) return;
    const remaining = deadline - now();
    if (remaining <= 0) {
      // Finaliza antes de avisar: outras atualizações não repetem o som.
      deadline = null;
      stopInterval();
      seconds = REST_SECONDS;
      onChange({ seconds, running: false, completed: true });
      const finishedGeneration = generation;
      onComplete(() => !disposed && generation === finishedGeneration);
      return;
    }
    const next = Math.max(0, Math.floor(remaining / 1000));
    if (next !== seconds) {
      seconds = next;
      onChange({ seconds, running: true, completed: false });
    }
  }

  return {
    start() {
      if (disposed) return;
      generation += 1;
      stopInterval();
      deadline = now() + REST_SECONDS * 1000;
      seconds = REST_SECONDS;
      onChange({ seconds, running: true, completed: false });
      cancel = schedule(refresh);
    },
    refresh,
    dispose() {
      disposed = true;
      generation += 1;
      deadline = null;
      stopInterval();
    },
  };
}
