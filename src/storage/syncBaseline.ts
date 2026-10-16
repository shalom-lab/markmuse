import type { GitHubConfig } from '../types/type';

// 同步基线存储：记录上次成功同步时每个文件的 SHA
// 用于判断文件是否被修改，以及处理冲突

function baselineKey(cfg?: GitHubConfig): string {
  // Do not trust legacy unscoped baselines for a configured repository.
  return cfg ? 'markmuse-sync-baseline:v2:' + JSON.stringify([
    cfg.owner.toLowerCase(), cfg.repo.toLowerCase(), cfg.branch,
    (cfg.basePath || '').replace(/^\/+|\/+$/g, '')
  ]) : 'markmuse-sync-baseline';
}

export interface SyncBaseline {
  [path: string]: string; // path -> sha
}

/**
 * 获取同步基线（上次同步时的 SHA 映射）
 */
export function getSyncBaseline(cfg?: GitHubConfig): SyncBaseline {
  try {
    const stored = localStorage.getItem(baselineKey(cfg));
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * 更新单个文件的基线 SHA
 */
export function updateFileBaseline(path: string, sha: string, cfg?: GitHubConfig): void {
  const baseline = getSyncBaseline(cfg);
  baseline[path] = sha;
  localStorage.setItem(baselineKey(cfg), JSON.stringify(baseline));
}

/**
 * 批量更新基线 SHA
 */
export function updateBaseline(updates: Record<string, string>, cfg?: GitHubConfig): void {
  const baseline = getSyncBaseline(cfg);
  Object.assign(baseline, updates);
  localStorage.setItem(baselineKey(cfg), JSON.stringify(baseline));
}

/**
 * 移除文件的基线记录（文件被删除时）
 */
export function removeFileBaseline(path: string, cfg?: GitHubConfig): void {
  const baseline = getSyncBaseline(cfg);
  delete baseline[path];
  localStorage.setItem(baselineKey(cfg), JSON.stringify(baseline));
}

/**
 * 清空同步基线（用于重新同步）
 */
export function clearBaseline(cfg?: GitHubConfig): void {
  localStorage.removeItem(baselineKey(cfg));
}

/**
 * 获取文件的基线 SHA
 */
export function getFileBaseline(path: string, cfg?: GitHubConfig): string | undefined {
  return getSyncBaseline(cfg)[path];
}

