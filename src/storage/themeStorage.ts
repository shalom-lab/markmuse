import { getAppRootDir, readTextFile, writeTextFile, deleteFile } from './opfsFs';
import { themes as builtInThemes } from '../themes';
import type { StoredTheme } from '../types/type';

const THEMES_DIR = '.themes';
const INIT_FLAG_KEY = 'markmuse-themes-initialized';
const META_STORAGE_KEY = 'markmuse-themes-meta';

// 元数据接口（存储在 localStorage）
interface ThemeMeta {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// 获取主题元数据（从 localStorage）
function getThemeMeta(): Record<string, ThemeMeta> {
  try {
    const stored = localStorage.getItem(META_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// 保存主题元数据（到 localStorage）
function saveThemeMeta(meta: Record<string, ThemeMeta>): void {
  localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
}

// 从 CSS 内容中解析主题名称：取第一行块注释内的文字
function extractNameFromCss(css: string, fallback: string): string {
  const match = css.match(/\/\*\s*([^*]+?)\s*\*\//);
  if (match && match[1]) {
    return match[1].trim();
  }
  return fallback;
}

// 验证 ID 格式（只允许英文、数字、-、_）
export function validateThemeId(id: string): { valid: boolean; error?: string } {
  if (!id || !id.trim()) {
    return { valid: false, error: '主题 ID 不能为空' };
  }
  
  const trimmed = id.trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: '主题 ID 只能包含英文、数字、连字符(-)和下划线(_)' };
  }
  
  return { valid: true };
}

// 获取主题文件路径（约定：.themes/{id}.css）
function getThemeFilePath(id: string): string {
  return `.themes/${id}.css`;
}

// 列出所有主题（从 OPFS 读取 .css 文件）
export async function listThemes(): Promise<StoredTheme[]> {
  const root = await getAppRootDir();
  let themesDir: FileSystemDirectoryHandle;
  
  try {
    themesDir = await root.getDirectoryHandle(THEMES_DIR, { create: false });
  } catch {
    // 目录不存在，返回空数组
    return [];
  }

  const themes: StoredTheme[] = [];
  const meta = getThemeMeta();

  // 遍历 themes 目录下的所有 .css 文件
  for await (const [name, handle] of (themesDir as any).entries()) {
    if (handle.kind !== 'file' || !name.endsWith('.css')) continue;
    
    const id = name.slice(0, -4); // 文件名去掉 .css
    const filePath = getThemeFilePath(id);
    
    try {
      // 读取 CSS 内容
      const css = await readTextFile(filePath);
      if (!css) continue;

      // 从 CSS 注释中解析展示名称
      const parsedName = extractNameFromCss(css, id);

      // 获取元数据（如果存在），否则用解析出来的名称
      const themeMeta = meta[id] || {
        id,
        name: parsedName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      themes.push({
        id: themeMeta.id,
        name: themeMeta.name,
        css,
        createdAt: themeMeta.createdAt,
        updatedAt: themeMeta.updatedAt
      });
    } catch (e) {
      console.error('读取主题文件失败:', name, e);
    }
  }

  return themes;
}

export async function getThemeByName(nameOrId: string): Promise<StoredTheme | null> {
  const all = await listThemes();
  return all.find(t => t.name === nameOrId || t.id === nameOrId) || null;
}

export async function themeNameExists(name: string): Promise<boolean> {
  const all = await listThemes();
  return all.some(t => t.name === name);
}

// 检查某个 ID 是否已被占用（用于生成唯一 id）
async function themeIdExists(id: string): Promise<boolean> {
  const all = await listThemes();
  return all.some(t => t.id === id);
}

/**
 * 创建新主题
 * @param id 主题 ID（英文、数字、-、_，用作文件名 .themes/{id}.css）
 * @param name 主题名称（中文/任意，作为 CSS 第一行注释）
 * @param css CSS 内容（会自动添加 name 作为第一行注释）
 */
export async function createTheme(id: string, name: string, css: string): Promise<StoredTheme> {
  // 验证 ID 格式
  const idValidation = validateThemeId(id);
  if (!idValidation.valid) {
    throw new Error(idValidation.error || '主题 ID 格式不正确');
  }

  const trimmedId = id.trim();

  // 检查 ID 是否已存在
  if (await themeIdExists(trimmedId)) {
    throw new Error(`主题 ID "${trimmedId}" 已存在`);
  }

  // 检查名称是否已存在（可选，如果允许同名但不同 ID）
  const exists = await themeNameExists(name);
  if (exists) {
    throw new Error(`主题名称 "${name}" 已存在`);
  }

  const now = new Date().toISOString();

  // 确保 CSS 第一行注释是 /* {name} */
  let cssWithHeader = css.trim();
  // 如果已有注释，替换第一段注释；否则添加
  if (cssWithHeader.startsWith('/*')) {
    // 替换第一段注释
    cssWithHeader = cssWithHeader.replace(/\/\*[\s\S]*?\*\//, `/* ${name} */`);
  } else {
    // 添加注释作为第一行
    cssWithHeader = `/* ${name} */\n` + cssWithHeader;
  }

  // 保存 CSS 文件到 OPFS（文件名：id.css）
  const filePath = getThemeFilePath(trimmedId);
  await writeTextFile(filePath, cssWithHeader);

  // 保存元数据到 localStorage
  const meta = getThemeMeta();
  meta[trimmedId] = {
    id: trimmedId,
    name,
    createdAt: now,
    updatedAt: now
  };
  saveThemeMeta(meta);

  return {
    id: trimmedId,
    name,
    css: cssWithHeader,
    createdAt: now,
    updatedAt: now
  };
}

export async function updateTheme(
  id: string,
  update: Partial<Pick<StoredTheme, 'name' | 'css'>>
): Promise<StoredTheme> {
  // 先找到当前主题（按 id 查）
  const all = await listThemes();
  const current = all.find(t => t.id === id);
  if (!current) {
    throw new Error(`主题 "${id}" 不存在`);
  }

  const now = new Date().toISOString();
  const meta = getThemeMeta();

  // 读取当前 CSS
  const filePath = getThemeFilePath(id);
  const currentCss = (await readTextFile(filePath)) ?? current.css;
  let nextCss = update.css ?? currentCss;

  // 如果更新了名称，需要同步更新 CSS 顶部注释
  let nextName = current.name;
  if (update.name && update.name !== current.name) {
    if (await themeNameExists(update.name)) {
      throw new Error(`主题名称 "${update.name}" 已存在`);
    }
    nextName = update.name;

    // 更新或添加顶部注释
    const trimmed = nextCss.trimStart();
    if (trimmed.startsWith('/*')) {
      // 替换第一段注释
      nextCss = nextCss.replace(/\/\*[\s\S]*?\*\//, `/* ${nextName} */`);
    } else {
      nextCss = `/* ${nextName} */\n` + nextCss;
    }
  }

  // 写回 CSS 文件
  await writeTextFile(filePath, nextCss);

  // 更新元数据
  meta[id] = {
    id,
    name: nextName,
    createdAt: current.createdAt,
    updatedAt: now
  };

  saveThemeMeta(meta);

  return {
    id,
    name: nextName,
    css: nextCss,
    createdAt: current.createdAt,
    updatedAt: now
  };
}

export async function deleteTheme(id: string): Promise<void> {
  // 先找到主题（按 id）
  const all = await listThemes();
  const theme = all.find(t => t.id === id);
  if (!theme) {
    throw new Error(`主题 "${id}" 不存在`);
  }

  // 删除 CSS 文件（文件名：id.css）
  const filePath = getThemeFilePath(id);
  await deleteFile(filePath);

  // 删除元数据
  const meta = getThemeMeta();
  delete meta[id];
  saveThemeMeta(meta);
}

/**
 * 确保内置主题始终存在于 OPFS
 * 检查每个内置主题是否存在，如果不存在则创建/恢复
 */
export async function ensureBuiltInThemes(): Promise<void> {
  const now = new Date().toISOString();
  const meta = getThemeMeta();

  for (const theme of builtInThemes) {
    const id = theme.id; // 内置主题的 id 已经是英文格式（如 'default', 'warm'）
    const filePath = getThemeFilePath(id);

    try {
      // 检查文件是否存在
      const existing = await readTextFile(filePath);
      
      // 准备标准化的 CSS（第一行注释必须是 /* {theme.name} */）
      let cssWithName = theme.css.trim();
      
      // 确保 CSS 第一行注释是 /* {theme.name} */
      if (cssWithName.startsWith('/*')) {
        // 替换第一段注释为标准格式
        cssWithName = cssWithName.replace(/\/\*[\s\S]*?\*\//, `/* ${theme.name} */`);
      } else {
        // 如果没有注释，添加标准注释
        cssWithName = `/* ${theme.name} */\n` + cssWithName;
      }
      
      if (!existing) {
        // 文件不存在，创建它
        await writeTextFile(filePath, cssWithName);
        console.log(`✅ 恢复内置主题: ${id}.css`);
      } else {
        // 文件存在，但需要确保第一行注释是正确的（内置主题的注释应该始终是标准格式）
        const existingName = extractNameFromCss(existing, theme.name);
        if (existingName !== theme.name) {
          // 注释不匹配，更新为标准格式
          await writeTextFile(filePath, cssWithName);
          console.log(`✅ 更新内置主题注释: ${id}.css`);
        }
      }

      // 更新/确保元数据存在
      if (!meta[id]) {
        meta[id] = {
          id,
          name: theme.name,
          createdAt: now,
          updatedAt: now
        };
      }
    } catch (error) {
      console.error(`确保内置主题失败: ${id}`, error);
    }
  }

  saveThemeMeta(meta);
  localStorage.setItem(INIT_FLAG_KEY, 'true');
}

/**
 * 初始化内置主题到 OPFS（首次运行时执行）
 * 将 src/themes/index.ts 中的内置主题导出为独立的 .css 文件
 * 现在改为使用 ensureBuiltInThemes，确保内置主题始终存在
 */
export async function initializeBuiltInThemes(): Promise<void> {
  await ensureBuiltInThemes();
  console.log('✅ 内置主题已确保存在于 OPFS');
}


