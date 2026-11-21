/** Uma fila única para consultas e transações das duas áreas, na mesma conexão SQLite. */
export function createDatabaseQueue() {
  let tail: Promise<unknown> = Promise.resolve();
  return function run<T>(action: () => Promise<T>): Promise<T> {
    const result = tail.then(action);
    tail = result.catch(() => {});
    return result;
  };
}

// O Proxy mantém os nomes e tipos dos métodos; somente organiza a execução.
export function serializedRepository<T extends object>(repository: T, run: ReturnType<typeof createDatabaseQueue>): T {
  return new Proxy(repository, {
    get(target, key, receiver) {
      const method = Reflect.get(target, key, receiver);
      return typeof method === 'function' ? (...args: unknown[]) => run(() => method.apply(target, args)) : method;
    },
  });
}
