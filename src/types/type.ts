// 统一类型定义入口

// GitHub 配置
export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  basePath: string; // 如: '', 'docs'
}

// ============================================================================
// OPFS + localStorage 结构
// ============================================================================

/**
 * OPFS 文件系统条目（基础结构）
 * 
 * 使用路径（path-based）而非 ID 结构，更符合文件系统的自然模型
 * 
 * 示例：
 * - 文件: { path: "notes/日记.md", isDirectory: false }
 * - 文件夹: { path: "notes/日记", isDirectory: true }
 */
export interface FsEntry {
  path: string;        // 例如: "folder1/folder2/file.md"
  isDirectory: boolean;
}

/**
 * 文件树节点（用于构建树形结构）
 * 
 * 基于 OPFS 路径的文件树表示，用于 UI 展示和操作
 * 
 * 特性：
 * - 使用路径结构
 * - 支持嵌套的 children 结构
 * - 文件可包含 content（按需加载）
 */
export interface FileTreeNode {
  path: string;           // 完整路径，如 "notes/日记/2025-01-01.md" 或 "notes/日记"
  name: string;           // 文件名或文件夹名
  type: 'file' | 'folder';
  children?: FileTreeNode[];  // 仅文件夹有 children
  content?: string;       // 仅文件有 content（可选，按需加载）
}

/**
 * 主题接口（运行时使用）
 * 
 * 用于应用中的主题展示和切换，不包含时间戳等存储元数据
 * 
 * 存储位置：
 * - CSS 文件：OPFS .themes/{id}.css
 * - 元数据：localStorage (markmuse-themes-meta)
 */
export interface Theme {
  id: string;   // 稳定 ID，与文件名（id.css）对应，只允许英文、数字、-、_
  name: string; // 展示名称（中文/任意）
  css: string;  // CSS 内容
}

/**
 * 存储的主题结构（包含完整元数据）
 * 
 * 从 OPFS 和 localStorage 读取的完整主题信息
 * 
 * 注意：
 * - createdAt/updatedAt 使用 ISO 字符串格式（而非 Date 对象）
 * - 元数据存储在 localStorage，CSS 内容存储在 OPFS
 */
export interface StoredTheme {
  id: string;
  name: string;
  css: string;
  createdAt: string;  // ISO 字符串格式
  updatedAt: string;   // ISO 字符串格式
}

// Slash 命令
export interface Command {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
  action: () => { text: string; cursorOffset: number };
}

// ============================================================================
// 路径常量定义
// ============================================================================

/**
 * 文件存储目录常量
 * 
 * 物理路径结构：
 * - 用户文件：files/foo/bar.md
 * - 主题文件：.themes/default.css
 */
export const FILES_DIR = 'files';
export const THEMES_DIR = '.themes';


