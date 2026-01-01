import { db, ITheme } from './index';

export type { ITheme };

// 获取所有自定义主题
export async function getCustomThemes(): Promise<ITheme[]> {
  return await db.themes.filter(theme => theme.isCustom === true).toArray();
}

// 获取所有主题（包括内置和自定义）
export async function getAllThemes(): Promise<ITheme[]> {
  return await db.themes.toArray();
}

// 根据 ID 获取主题
export async function getThemeById(id: number): Promise<ITheme | undefined> {
  return await db.themes.get(id);
}

// 根据名称获取主题
export async function getThemeByName(name: string): Promise<ITheme | undefined> {
  return await db.themes.where('name').equals(name).and(theme => theme.isCustom === true).first();
}

// 创建新主题
export async function createTheme(name: string, css: string): Promise<number> {
  const now = new Date();
  return await db.themes.add({
    name,
    css,
    isCustom: true,
    createdAt: now,
    updatedAt: now
  });
}

// 更新主题
export async function updateTheme(id: number, updates: Partial<ITheme>): Promise<number> {
  const updateData: Partial<ITheme> = {
    ...updates,
    updatedAt: new Date()
  };
  return await db.themes.update(id, updateData);
}

// 删除主题
export async function deleteTheme(id: number): Promise<void> {
  await db.themes.delete(id);
}

// 检查主题名称是否已存在
export async function themeNameExists(name: string, excludeId?: number): Promise<boolean> {
  const existing = await db.themes
    .where('name')
    .equals(name)
    .and(theme => theme.isCustom === true)
    .toArray();
  
  if (excludeId) {
    return existing.some(theme => theme.id !== excludeId);
  }
  return existing.length > 0;
}

