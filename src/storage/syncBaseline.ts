// 同步基线存储：记录上次成功同步时每个文件的 SHA
// 用于判断文件是否被修改，以及处理冲突

const BASELINE_KEY = 'markmuse-sync-baseline';

export interface SyncBaseline {
  [path: string]: string; // path -> sha
}

/**
 * 获取同步基线（上次同步时的 SHA 映射）
 */
export function getSyncBaseline(): SyncBaseline {
  try {
    const stored = localStorage.getItem(BASELINE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * 更新单个文件的基线 SHA
 */
export function updateFileBaseline(path: string, sha: string): void {
  const baseline = getSyncBaseline();
  baseline[path] = sha;
  localStorage.setItem(BASELINE_KEY, JSON.stringify(baseline));
}

/**
 * 批量更新基线 SHA
 */
export function updateBaseline(updates: Record<string, string>): void {
  const baseline = getSyncBaseline();
  Object.assign(baseline, updates);
  localStorage.setItem(BASELINE_KEY, JSON.stringify(baseline));
}

/**
 * 移除文件的基线记录（文件被删除时）
 */
export function removeFileBaseline(path: string): void {
  const baseline = getSyncBaseline();
  delete baseline[path];
  localStorage.setItem(BASELINE_KEY, JSON.stringify(baseline));
}

/**
 * 清空同步基线（用于重新同步）
 */
export function clearBaseline(): void {
  localStorage.removeItem(BASELINE_KEY);
}

/**
 * 获取文件的基线 SHA
 */
export function getFileBaseline(path: string): string | undefined {
  return getSyncBaseline()[path];
}

