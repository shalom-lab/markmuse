import type { GitHubConfig } from '../types/type';

const CONFIG_KEY = 'markmuse-github-config';

export function loadGitHubConfig(): GitHubConfig | null {
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GitHubConfig;
  } catch {
    return null;
  }
}

export function saveGitHubConfig(cfg: GitHubConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
}


