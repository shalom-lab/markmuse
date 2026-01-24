/**
 * 设置存储服务
 * 安全存储敏感信息（如 GitHub Token）到 localStorage
 */

import type { GitHubConfig } from '../types/type';
import { Octokit } from '@octokit/rest';

interface Settings {
  autoSave?: boolean;
  autoSyncInterval?: number; // 分钟，0 表示关闭
  defaultTheme?: string; // 默认主题
}

// localStorage 键名
const SETTINGS_KEY = 'markmuse-settings';
const REPO_KEY = 'markmuse-repo';
const TOKEN_KEY = 'markmuse-token';
const PATH_KEY = 'markmuse-path';
const BRANCH_KEY = 'markmuse-branch';
const DEFAULT_THEME_KEY = 'markmuse-default-theme'; // localStorage 降级存储

/**
 * 获取设置（从 localStorage）
 */
export async function getSettings(): Promise<Settings> {
  try {
    // 从 localStorage 获取基本设置
    const settingsStr = localStorage.getItem(SETTINGS_KEY);
    const settings: Settings = settingsStr ? JSON.parse(settingsStr) : {
      autoSave: true,
      autoSyncInterval: 30,
    };

    // 从 localStorage 获取 defaultTheme
    try {
      const fallbackTheme = localStorage.getItem(DEFAULT_THEME_KEY);
      if (fallbackTheme) {
        settings.defaultTheme = fallbackTheme;
      }
    } catch (e) {
      // localStorage 失败，忽略
    }

    return settings;
  } catch (error) {
    console.error('获取设置失败:', error);
    return {
      autoSave: true,
      autoSyncInterval: 30,
    };
  }
}

/**
 * 保存设置（所有设置存 localStorage）
 */
export async function saveSettings(settings: Settings): Promise<void> {
  try {
    // 分离 defaultTheme
    const { defaultTheme, ...otherSettings } = settings;

    // 保存基本设置到 localStorage
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(otherSettings));

    // 保存 defaultTheme 到 localStorage
    if (defaultTheme !== undefined) {
      try {
        if (defaultTheme) {
          localStorage.setItem(DEFAULT_THEME_KEY, defaultTheme);
        } else {
          localStorage.removeItem(DEFAULT_THEME_KEY);
        }
      } catch (e) {
        console.error('保存 defaultTheme 失败:', e);
      }
    }
  } catch (error) {
    console.error('保存设置失败:', error);
    throw error;
  }
}

/**
 * 清除所有设置（包括 GitHub 配置）
 */
export async function clearSettings(): Promise<void> {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(REPO_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PATH_KEY);
  localStorage.removeItem(BRANCH_KEY);
  localStorage.removeItem(DEFAULT_THEME_KEY);
}

/**
 * 获取 GitHub 配置（从 localStorage）
 */
export function getGitHubConfig(): GitHubConfig | null {
  const repo = localStorage.getItem(REPO_KEY);
  const token = localStorage.getItem(TOKEN_KEY);
  const path = localStorage.getItem(PATH_KEY) || '';
  const branch = localStorage.getItem(BRANCH_KEY) || 'main';

  if (!repo || !token) {
    return null;
  }

  // 清理 repo 字符串：去除首尾空格和斜杠
  const cleanRepo = repo.trim().replace(/^\/+|\/+$/g, '');
  
  // 分割 owner/repo
  const parts = cleanRepo.split('/').filter(Boolean);
  if (parts.length !== 2) {
    console.error('GitHub 仓库格式错误，应为 owner/repo，当前值:', repo);
    return null;
  }

  const [owner, repoName] = parts;
  if (!owner || !repoName) {
    console.error('GitHub 仓库解析失败，owner 或 repo 为空:', { owner, repoName, original: repo });
    return null;
  }

  return {
    token,
    owner,
    repo: repoName,
    branch,
    basePath: path,
  };
}

/**
 * 保存 GitHub 配置（到 localStorage）
 */
export function saveGitHubConfig(config: Partial<GitHubConfig> & { repo: string; token: string }): void {
  if (config.repo) {
    localStorage.setItem(REPO_KEY, config.repo);
  }
  if (config.token !== undefined) {
    if (config.token) {
      localStorage.setItem(TOKEN_KEY, config.token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
  if (config.basePath !== undefined) {
    localStorage.setItem(PATH_KEY, config.basePath || '');
  }
  if (config.branch) {
    localStorage.setItem(BRANCH_KEY, config.branch);
  }
}

/**
 * 验证 GitHub 仓库访问权限并获取默认分支
 * 使用 GitHub API 返回的 permissions 字段验证读写权限（无需创建/删除测试文件）
 * @returns { defaultBranch: string } 如果验证成功
 * @throws Error 如果验证失败
 */
export async function verifyGitHubAccess(repo: string, token: string): Promise<{ defaultBranch: string }> {
  const [owner, repoName] = repo.split('/');
  if (!owner || !repoName) {
    throw new Error('仓库格式错误，应为 owner/repo');
  }

  const octokit = new Octokit({ auth: token });

  try {
    // 获取仓库信息和权限（一次 API 调用完成所有验证）
    const { data } = await octokit.rest.repos.get({ owner, repo: repoName });

    const defaultBranch = data.default_branch || 'main';

    // 检查读取权限
    if (!data.permissions?.pull) {
      throw new Error('Token 没有读取权限，请确保 Token 有 Contents 的 Read 权限');
    }

    // 检查写入权限
    if (!data.permissions?.push) {
      throw new Error('Token 没有写入权限，请确保 Token 有 Contents 的 Read and write 权限。Fine-grained token 需要选择正确的仓库。');
    }

    return { defaultBranch };
  } catch (error: any) {
    if (error.status === 401) {
      throw new Error('Token 无效或已过期');
    }
    if (error.status === 403) {
      throw new Error('Token 权限不足，请确保 Token 有仓库访问权限');
    }
    if (error.status === 404) {
      throw new Error('仓库不存在或 Token 没有访问权限');
    }
    // 如果错误信息中已经包含了具体原因，直接抛出
    if (error.message && error.message.includes('没有')) {
      throw error;
    }
    throw new Error(`验证失败: ${error.message || '未知错误'}`);
  }
}


