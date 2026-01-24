/**
 * 路径工具函数
 * 统一管理逻辑路径和物理路径的转换
 * 
 * 物理路径（OPFS 实际存储）：
 * - files/foo/bar.md
 * - .themes/default.css
 * 
 * 逻辑路径（用户看到的路径）：
 * - foo/bar.md
 * - (主题路径保持不变)
 */

import { FILES_DIR, THEMES_DIR } from '../types/type';

/**
 * 将逻辑路径转换为物理路径（用户文件）
 * @param logicalPath 逻辑路径，如 "foo/bar.md"
 * @returns 物理路径，如 "files/foo/bar.md"
 */
export function toPhysicalPath(logicalPath: string): string {
  if (!logicalPath) return '';
  // 如果已经是物理路径，直接返回
  if (logicalPath.startsWith(`${FILES_DIR}/`) || logicalPath.startsWith(`${THEMES_DIR}/`)) {
    return logicalPath;
  }
  return `${FILES_DIR}/${logicalPath}`;
}

/**
 * 将物理路径转换为逻辑路径（用户文件）
 * @param physicalPath 物理路径，如 "files/foo/bar.md"
 * @returns 逻辑路径，如 "foo/bar.md"
 */
export function toLogicalPath(physicalPath: string): string {
  if (!physicalPath) return '';
  // 去掉 files/ 前缀
  if (physicalPath.startsWith(`${FILES_DIR}/`)) {
    return physicalPath.slice(`${FILES_DIR}/`.length);
  }
  // 主题路径保持不变
  if (physicalPath.startsWith(`${THEMES_DIR}/`)) {
    return physicalPath;
  }
  return physicalPath;
}

/**
 * 获取主题文件的物理路径
 * @param themeId 主题 ID
 * @returns 物理路径，如 ".themes/default.css"
 */
export function getThemePhysicalPath(themeId: string): string {
  return `${THEMES_DIR}/${themeId}.css`;
}

/**
 * 检查路径是否是用户文件（而非系统文件）
 */
export function isUserFile(path: string): boolean {
  return path.startsWith(`${FILES_DIR}/`) || 
         (!path.startsWith(`${THEMES_DIR}/`) && !path.includes('/'));
}

/**
 * 检查路径是否是主题文件
 */
export function isThemeFile(path: string): boolean {
  return path.startsWith(`${THEMES_DIR}/`);
}


