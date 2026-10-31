export type SaveState = { pending: number; error: boolean };

// Falhas interrompem a fila sem descartar alterações. O botão de tentar novamente a retoma.
export function createWriteQueue(onChange: (state: SaveState) => void) {
  const jobs: (() => Promise<void>)[] = [];
  let running: Promise<void> | undefined;
  let failed = false;

  function publish() { onChange({ pending: jobs.length, error: failed }); }

  function flush() {
    if (running || failed) return;
    running = Promise.resolve().then(async () => {
      try {
        while (jobs.length) {
          await jobs[0]();
          jobs.shift();
          publish();
        }
      } catch {
        failed = true;
        publish();
      }
    }).finally(() => { running = undefined; });
  }

  return {
    enqueue(job: () => Promise<void>) { jobs.push(job); publish(); flush(); },
    retry() { failed = false; publish(); flush(); },
    async whenSettled() { await running; },
  };
}
