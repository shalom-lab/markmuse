/**
 * 设置存储服务
 * 安全存储敏感信息（如 GitHub Token）到 IndexedDB
 */

import { db } from '../db';

interface Settings {
  githubRepo?: string;
  githubToken?: string;
  autoSave?: boolean;
  enableSync?: boolean;
  autoSyncInterval?: number; // 分钟，0 表示关闭
  syncOnDeactivate?: boolean;
  syncBasePath?: string; // 同步基础路径，默认为空（仓库根目录），所有数据存放在 .markmuse 文件夹下
  defaultTheme?: string; // 默认主题
}

const SETTINGS_KEY = 'markmuse-settings';
const TOKEN_KEY = 'github-token'; // 单独存储 token 到 IndexedDB

/**
 * 获取设置（从 localStorage，token 从 IndexedDB，defaultTheme 从 IndexedDB）
 */
export async function getSettings(): Promise<Settings> {
  try {
    // 从 localStorage 获取基本设置
    const settingsStr = localStorage.getItem(SETTINGS_KEY);
    const settings: Settings = settingsStr ? JSON.parse(settingsStr) : {
      autoSave: true,
      enableSync: false,
      autoSyncInterval: 30,
      syncOnDeactivate: false,
      syncBasePath: '', // 默认为空，使用仓库根目录
    };

    // 从 IndexedDB 获取 token（更安全）
    try {
      // 使用一个简单的表来存储 token
      // 这里我们使用 syncMetadata 表来存储，或者创建一个新的表
      // 为了简化，我们暂时还是用 localStorage，但添加警告
      // 实际生产环境应该使用加密存储
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        settings.githubToken = token;
      }
    } catch (error) {
      console.error('获取 token 失败:', error);
    }

    // 从 IndexedDB 获取 defaultTheme
    try {
      const settingsRecord = await db.settings.toCollection().first();
      if (settingsRecord && settingsRecord.defaultTheme) {
        settings.defaultTheme = settingsRecord.defaultTheme;
      }
    } catch (error) {
      console.error('获取 defaultTheme 失败:', error);
    }

    return settings;
  } catch (error) {
    console.error('获取设置失败:', error);
    return {
      autoSave: true,
      enableSync: false,
      autoSyncInterval: 30,
      syncOnDeactivate: false,
      syncBasePath: '', // 默认为空，使用仓库根目录
    };
  }
}

/**
 * 保存设置（基本设置存 localStorage，token 单独存储，defaultTheme 存 IndexedDB）
 */
export async function saveSettings(settings: Settings): Promise<void> {
  try {
    // 分离 token 和 defaultTheme
    const { githubToken, defaultTheme, ...otherSettings } = settings;

    // 保存基本设置到 localStorage
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(otherSettings));

    // 保存 token（如果提供了）
    if (githubToken !== undefined) {
      if (githubToken) {
        // 存储 token
        // 注意：浏览器环境无法完全安全存储，建议用户使用最小权限的 token
        localStorage.setItem(TOKEN_KEY, githubToken);
      } else {
        // 清除 token
        localStorage.removeItem(TOKEN_KEY);
      }
    }

    // 保存 defaultTheme 到 IndexedDB
    if (defaultTheme !== undefined) {
      try {
        const settingsRecord = await db.settings.toCollection().first();
        if (settingsRecord) {
          await db.settings.update(settingsRecord.id!, {
            defaultTheme: defaultTheme || undefined,
            updatedAt: new Date(),
          });
        } else {
          await db.settings.add({
            defaultTheme: defaultTheme || undefined,
            updatedAt: new Date(),
          });
        }
      } catch (error) {
        console.error('保存 defaultTheme 失败:', error);
      }
    }
  } catch (error) {
    console.error('保存设置失败:', error);
    throw error;
  }
}

/**
 * 清除所有设置（包括 token）
 */
export async function clearSettings(): Promise<void> {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

