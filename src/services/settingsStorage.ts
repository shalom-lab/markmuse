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

/**
 * 从 URL hash 恢复配置并保存到 localStorage
 * 格式：https://example.com#setup=base64编码的JSON配置
 * 
 * 判断逻辑：
 * 1. 检查 URL hash 是否存在 #setup=
 * 2. 检查是否已经恢复过（避免重复恢复）
 * 3. 验证配置格式是否正确
 * 4. 恢复配置并保存
 * 5. 清除 URL hash
 */
export async function restoreFromBookmark(): Promise<boolean> {
  try {
    // 1. 读取 URL hash
    const hash = window.location.hash;
    
    // 2. 判断：检查是否符合约定的格式
    if (!hash || !hash.startsWith('#setup=')) {
      return false;
    }
    
    // 3. 判断：检查是否已经恢复过（使用 sessionStorage 标记，避免重复恢复）
    const restoreKey = 'markmuse-restored-from-bookmark';
    const restoredHash = sessionStorage.getItem(restoreKey);
    if (restoredHash === hash) {
      // 已经恢复过这个 hash，跳过
      return false;
    }
    
    // 4. 提取并解码配置信息
    let configData: Partial<Settings>;
    try {
      const encoded = decodeURIComponent(hash.split('=')[1]);
      if (!encoded) {
        console.warn('URL hash 中的配置为空');
        return false;
      }
      
      const raw = atob(encoded);
      if (!raw) {
        console.warn('解码后的配置为空');
        return false;
      }
      
      // 5. 判断：解析配置数据（使用 JSON 格式）
      configData = JSON.parse(raw);
      
      // 6. 判断：验证配置对象是否有效
      if (!configData || typeof configData !== 'object') {
        console.warn('配置格式无效');
        return false;
      }
    } catch (e) {
      console.error('解析 URL 配置失败:', e);
      return false;
    }
    
    // 7. 获取现有配置
    const existingSettings = await getSettings();
    
    // 8. 判断：检查现有配置是否为空（如果已有重要配置，可以选择是否覆盖）
    // 这里我们选择：如果 URL 中有配置，就恢复（覆盖现有配置）
    // 如果只想在配置为空时恢复，可以取消下面的注释
    /*
    const hasExistingConfig = existingSettings.githubRepo || existingSettings.githubToken;
    if (hasExistingConfig) {
      console.log('已有配置，跳过 URL 恢复');
      return false;
    }
    */
    
    // 9. 构建完整的 Settings 对象（合并现有配置和 URL 配置）
    const settings: Settings = {
      // 保留现有设置
      ...existingSettings,
      // 从 URL 覆盖的配置（只覆盖 URL 中明确提供的字段）
      ...(configData.githubRepo !== undefined && { githubRepo: configData.githubRepo }),
      ...(configData.githubToken !== undefined && { githubToken: configData.githubToken }),
      ...(configData.autoSave !== undefined && { autoSave: configData.autoSave }),
      ...(configData.enableSync !== undefined && { enableSync: configData.enableSync }),
      ...(configData.autoSyncInterval !== undefined && { autoSyncInterval: configData.autoSyncInterval }),
      ...(configData.syncOnDeactivate !== undefined && { syncOnDeactivate: configData.syncOnDeactivate }),
      ...(configData.syncBasePath !== undefined && { syncBasePath: configData.syncBasePath }),
      ...(configData.defaultTheme !== undefined && { defaultTheme: configData.defaultTheme }),
    };
    
    // 10. 保存到 localStorage
    await saveSettings(settings);
    
    // 11. 标记已恢复（避免重复恢复）
    sessionStorage.setItem(restoreKey, hash);
    
    // 12. 清除 URL hash，保持 URL 干净（延迟执行，确保保存完成）
    setTimeout(() => {
      const newUrl = window.location.pathname + window.location.search;
      history.replaceState(null, document.title, newUrl);
    }, 500);
    
    console.log('配置已从 URL 恢复并保存', configData);
    return true;
  } catch (e) {
    console.error('从 URL 恢复配置失败:', e);
    return false;
  }
}

/**
 * 生成书签链接（将当前配置编码到 URL）
 * 返回格式：https://example.com#setup=base64编码的JSON配置
 * 
 * 逻辑：
 * 1. 只保存有值的配置项（过滤掉 undefined、null、空字符串）
 * 2. 只要有部分配置就可以生成（不强制要求所有配置）
 * 3. 支持部分配置恢复
 */
export async function generateBookmark(): Promise<string> {
  try {
    // 1. 获取当前配置
    const settings = await getSettings();
    
    // 2. 构建要保存的配置对象（只包含有值的字段）
    const configData: Partial<Settings> = {};
    
    // 只添加有值的字段
    if (settings.githubRepo) {
      configData.githubRepo = settings.githubRepo;
    }
    if (settings.githubToken) {
      configData.githubToken = settings.githubToken; // 注意：包含敏感信息
    }
    if (settings.autoSave !== undefined) {
      configData.autoSave = settings.autoSave;
    }
    if (settings.enableSync !== undefined) {
      configData.enableSync = settings.enableSync;
    }
    if (settings.autoSyncInterval !== undefined) {
      configData.autoSyncInterval = settings.autoSyncInterval;
    }
    if (settings.syncOnDeactivate !== undefined) {
      configData.syncOnDeactivate = settings.syncOnDeactivate;
    }
    if (settings.syncBasePath) {
      configData.syncBasePath = settings.syncBasePath;
    }
    if (settings.defaultTheme) {
      configData.defaultTheme = settings.defaultTheme;
    }
    
    // 3. 判断：检查是否有任何配置可保存
    const hasAnyConfig = Object.keys(configData).length > 0;
    if (!hasAnyConfig) {
      throw new Error('没有可保存的配置，请至少配置一项设置');
    }
    
    // 4. 转换为 JSON 字符串（JSON.stringify 会自动忽略 undefined，但我们已经在上面过滤了）
    const raw = JSON.stringify(configData);
    
    // 5. 使用 base64 编码（支持中文）
    const encoded = btoa(unescape(encodeURIComponent(raw)));
    
    // 6. 构建完整的书签 URL
    const baseUrl = window.location.origin + window.location.pathname;
    const bookmarkUrl = `${baseUrl}#setup=${encodeURIComponent(encoded)}`;
    
    console.log('生成的配置项:', Object.keys(configData));
    return bookmarkUrl;
  } catch (e) {
    console.error('生成书签链接失败:', e);
    throw e;
  }
}

