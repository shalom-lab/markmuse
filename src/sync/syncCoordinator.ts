type Preparation = (changesLocal: boolean) => Promise<void | (() => Promise<void>)>;
let prepare: Preparation | undefined;
let running = false;

export function registerSyncPreparation(callback: Preparation) {
  prepare = callback;
  return () => { if (prepare === callback) prepare = undefined; };
}

// All sync entry points share a lock. Web Locks also excludes other tabs.
export async function withSyncLock<T>(operation: () => Promise<T>, changesLocal = false): Promise<T> {
  if (running) throw new Error('已有同步任务正在执行，请稍后重试');
  running = true;
  const run = async () => {
    const release = await prepare?.(changesLocal);
    try { return await operation(); } finally { await release?.(); }
  };
  try {
    if (typeof navigator !== 'undefined' && navigator.locks) {
      return await navigator.locks.request('markmuse-sync', { ifAvailable: true }, async lock => {
        if (!lock) throw new Error('其他页面正在同步，请稍后重试');
        return run();
      });
    }
    return await run();
  } finally {
    running = false;
  }
}
