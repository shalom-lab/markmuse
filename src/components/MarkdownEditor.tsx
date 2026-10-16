import { useEffect, useRef, useState, useMemo } from 'react';
import MarkdownIt from 'markdown-it';
import markdownItMath from '../utils/markdown-it-math';
import { createHighlightFunction } from '../utils/highlight';
import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import Sidebar from './Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import SlashCommandMenu from './SlashCommandMenu';
import type { Command } from '../types/type';
import { Dialog } from './Dialog';
import { showToast } from '../utils/toast';
import EmojiPicker from './EmojiPicker';
import { createTheme, updateTheme, deleteTheme, validateThemeId } from '../storage/themeStorage';
import { Save } from 'lucide-react';
// 导入 highlight.js 的样式
import 'highlight.js/styles/github-dark.css';
// 导入 KaTeX 的样式
import 'katex/dist/katex.min.css';

interface Props {
  content: string;
  readOnly?: boolean;
  onChange: (content: string) => void;
  currentFilePath?: string | null;
  isMarkdownCollapsed: boolean;
  isPreviewCollapsed: boolean;
  isCssCollapsed: boolean;
  onFormatAction?: (shortcut: string) => void;
  autoSave?: boolean;
  onSave?: () => void;
}

export default function MarkdownEditor({ 
  content,
  readOnly = false,
  onChange,
  currentFilePath,
  isMarkdownCollapsed,
  isPreviewCollapsed,
  isCssCollapsed,
  onFormatAction: _onFormatAction,
  autoSave = true,
  onSave
}: Props) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const styleIdRef = useRef(`style-${Math.random().toString(36).slice(2)}`); // 生成唯一 ID
  const { currentTheme, setTheme } = useTheme();
  
  // 快捷命令菜单状态
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [commandPosition, setCommandPosition] = useState({ top: 0, left: 0 });
  const [slashIndex, setSlashIndex] = useState(-1);
  
  // Emoji 选择器状态
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPosition, setEmojiPosition] = useState({ top: 0, left: 0 });
  const [emojiInsertIndex, setEmojiInsertIndex] = useState(-1);

  // 样式管理状态
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveMode, setSaveMode] = useState<'update' | 'new'>('update');
  const [newThemeId, setNewThemeId] = useState(''); // 主题 ID（英文）
  const [newThemeName, setNewThemeName] = useState(''); // 主题名称（中文）
  const [currentThemeId, setCurrentThemeId] = useState<string | null>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    confirmText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const md = useRef((() => {
    const mdInstance = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true, // 恢复 typographer，自定义插件可以正确处理
      breaks: true
    });
    // 设置 highlight 函数，传入 mdInstance 以便使用其 escapeHtml 方法
    mdInstance.set({ highlight: createHighlightFunction(mdInstance) });
    return mdInstance.use(markdownItMath, {
      throwOnError: false,
      errorColor: '#cc0000'
    });
  })());

  const [customCss, setCustomCss] = useState(currentTheme.css);
  const { refreshThemes } = useTheme();
  
  // 获取当前主题的 ID（用于更新/删除）
  useEffect(() => {
    // 当前主题的 ID 就是 currentTheme.id（字符串）
    setCurrentThemeId(currentTheme.id || null);
  }, [currentTheme.id]);
  
  // 检查CSS是否有变化
  const hasCssChanged = useMemo(() => {
    return customCss !== currentTheme.css;
  }, [customCss, currentTheme.css]);
  
  // 计算文件路径（显示用）
  const filePath = useMemo(() => {
    if (!currentFilePath) return '';
    return currentFilePath;
  }, [currentFilePath]);

  // 更新预览
  const updatePreview = () => {
    if (previewRef.current && editorRef.current) {
      const result = md.current.render(editorRef.current.value || content);
      previewRef.current.innerHTML = result;
    }
  };

  // 获取光标位置
  const getCaretPosition = (textarea: HTMLTextAreaElement) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    return { start, end };
  };

  // 在光标处插入文本
  const insertTextAtCursor = (textarea: HTMLTextAreaElement, text: string, selectText: string = '') => {
    const { start, end } = getCaretPosition(textarea);
    const value = textarea.value;
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);
    const newValue = beforeText + text + afterText;
    
    textarea.value = newValue;
    
    if (selectText) {
      // 选中占位符文本，让用户可以直接输入替换
      const selectStart = start + text.indexOf(selectText);
      const selectEnd = selectStart + selectText.length;
      textarea.setSelectionRange(selectStart, selectEnd);
    } else {
      // 如果没有选中文本，将光标放在插入文本的末尾
      const newStart = start + text.length;
      textarea.setSelectionRange(newStart, newStart);
    }
    
    textarea.focus();
    onChange(newValue);
    updatePreview();
  };


  // 处理格式快捷键
  const handleFormatShortcut = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const { start, end } = getCaretPosition(textarea);
    const value = textarea.value;
    const selectedText = value.substring(start, end);
    
    // 检查是否按下了 Ctrl 或 Cmd
    const isCtrl = e.ctrlKey || e.metaKey;
    const isAlt = e.altKey;
    
    if (!isCtrl) return false;
    
    // 标题 (Ctrl+1-6)
    if (e.key >= '1' && e.key <= '6' && !isAlt) {
      e.preventDefault();
      const level = parseInt(e.key);
      const prefix = '#'.repeat(level) + ' ';
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);
      const lineStart = beforeText.lastIndexOf('\n') + 1;
      const lineEnd = afterText.indexOf('\n') === -1 ? value.length : end + afterText.indexOf('\n');
      const lineText = value.substring(lineStart, lineEnd);
      
      // 如果当前行已经是标题，移除标题标记
      const isHeading = /^#{1,6}\s/.test(lineText);
      const newLineText = isHeading ? lineText.replace(/^#{1,6}\s/, '') : prefix + lineText;
      const newValue = value.substring(0, lineStart) + newLineText + value.substring(lineEnd);
      
      textarea.value = newValue;
      const newPos = isHeading ? start - prefix.length : start + prefix.length;
      textarea.setSelectionRange(newPos, newPos);
      onChange(newValue);
      updatePreview();
      return true;
    }
    
    // 加粗 (Ctrl+B)
    if (e.key === 'b' && !isAlt) {
      e.preventDefault();
      if (selectedText) {
        // 如果有选中文本，直接包裹
        insertTextAtCursor(textarea, `**${selectedText}**`, '');
        // 选中整个加粗文本，让用户可以继续编辑
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - selectedText.length - 2, start - 2);
      } else {
        // 没有选中文本，插入并选中占位符
        insertTextAtCursor(textarea, `****`, '');
        // 选中中间的空格位置，让用户输入
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - 2, start - 2);
      }
      return true;
    }
    
    // 倾斜 (Ctrl+I)
    if (e.key === 'i' && !isAlt) {
      e.preventDefault();
      if (selectedText) {
        insertTextAtCursor(textarea, `*${selectedText}*`, '');
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - selectedText.length - 1, start - 1);
      } else {
        insertTextAtCursor(textarea, `**`, '');
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - 1, start - 1);
      }
      return true;
    }
    
    // 下划线 (Ctrl+U)
    if (e.key === 'u' && !isAlt) {
      e.preventDefault();
      if (selectedText) {
        insertTextAtCursor(textarea, `<u>${selectedText}</u>`, '');
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - selectedText.length - 3, start - 4);
      } else {
        insertTextAtCursor(textarea, `<u></u>`, '');
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - 4, start - 4);
      }
      return true;
    }
    
    // 行内代码 (Ctrl+E)
    if (e.key === 'e' && !isAlt) {
      e.preventDefault();
      if (selectedText) {
        insertTextAtCursor(textarea, `\`${selectedText}\``, '');
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - selectedText.length - 1, start - 1);
      } else {
        insertTextAtCursor(textarea, '``', '');
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - 1, start - 1);
      }
      return true;
    }
    
    // 行内公式 (Ctrl+M)
    if (e.key === 'm' && !isAlt) {
      e.preventDefault();
      if (selectedText) {
        insertTextAtCursor(textarea, `$${selectedText}$`, '');
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - selectedText.length - 1, start - 1);
      } else {
        insertTextAtCursor(textarea, '$$', '');
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - 1, start - 1);
      }
      return true;
    }
    
    // 链接 (Ctrl+K)
    if (e.key === 'k' && !isAlt) {
      e.preventDefault();
      const linkText = selectedText || '';
      insertTextAtCursor(textarea, `[${linkText}]()`, '');
      // 选中 url 部分
      const { start } = getCaretPosition(textarea);
      if (linkText) {
        textarea.setSelectionRange(start - 1, start - 1);
      } else {
        textarea.setSelectionRange(start - 3, start - 1);
      }
      return true;
    }
    
    // 需要 Alt 键的组合
    if (!isAlt) return false;
    
    // 删除线 (Ctrl+Alt+X)
    if (e.key === 'x' || e.key === 'X') {
      e.preventDefault();
      if (selectedText) {
        insertTextAtCursor(textarea, `~~${selectedText}~~`, '');
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - selectedText.length - 2, start - 2);
      } else {
        insertTextAtCursor(textarea, '~~~~', '');
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - 2, start - 2);
      }
      return true;
    }
    
    // 引用 (Ctrl+Alt+Q)
    if (e.key === 'q' || e.key === 'Q') {
      e.preventDefault();
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);
      const lineStart = beforeText.lastIndexOf('\n') + 1;
      const lineEnd = afterText.indexOf('\n') === -1 ? value.length : end + afterText.indexOf('\n');
      const lineText = value.substring(lineStart, lineEnd);
      const isQuote = lineText.startsWith('> ');
      const newLineText = isQuote ? lineText.substring(2) : '> ' + lineText;
      const newValue = value.substring(0, lineStart) + newLineText + value.substring(lineEnd);
      textarea.value = newValue;
      const newPos = isQuote ? start - 2 : start + 2;
      textarea.setSelectionRange(newPos, newPos);
      onChange(newValue);
      updatePreview();
      return true;
    }
    
    // 有序列表 (Ctrl+Alt+O)
    if (e.key === 'o' || e.key === 'O') {
      e.preventDefault();
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);
      const lineStart = beforeText.lastIndexOf('\n') + 1;
      const lineEnd = afterText.indexOf('\n') === -1 ? value.length : end + afterText.indexOf('\n');
      const lineText = value.substring(lineStart, lineEnd);
      const isOrderedList = /^\d+\.\s/.test(lineText);
      const newLineText = isOrderedList ? lineText.replace(/^\d+\.\s/, '') : '1. ' + lineText;
      const newValue = value.substring(0, lineStart) + newLineText + value.substring(lineEnd);
      textarea.value = newValue;
      const newPos = isOrderedList ? start - 3 : start + 3;
      textarea.setSelectionRange(newPos, newPos);
      onChange(newValue);
      updatePreview();
      return true;
    }
    
    // 无序列表 (Ctrl+Alt+U)
    if (e.key === 'u' || e.key === 'U') {
      e.preventDefault();
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);
      const lineStart = beforeText.lastIndexOf('\n') + 1;
      const lineEnd = afterText.indexOf('\n') === -1 ? value.length : end + afterText.indexOf('\n');
      const lineText = value.substring(lineStart, lineEnd);
      const isUnorderedList = /^[-*+]\s/.test(lineText);
      const newLineText = isUnorderedList ? lineText.replace(/^[-*+]\s/, '') : '- ' + lineText;
      const newValue = value.substring(0, lineStart) + newLineText + value.substring(lineEnd);
      textarea.value = newValue;
      const newPos = isUnorderedList ? start - 2 : start + 2;
      textarea.setSelectionRange(newPos, newPos);
      onChange(newValue);
      updatePreview();
      return true;
    }
    
    // 代码块 (Ctrl+Alt+E)
    if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      if (selectedText) {
        insertTextAtCursor(textarea, `\`\`\`\n${selectedText}\n\`\`\``, '');
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - selectedText.length - 4, start - 4);
      } else {
        insertTextAtCursor(textarea, '```\n\n```', '');
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - 4, start - 4);
      }
      return true;
    }
    
    // 公式块 (Ctrl+Alt+M)
    if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      if (selectedText) {
        insertTextAtCursor(textarea, `$$\n${selectedText}\n$$`, '');
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - selectedText.length - 3, start - 3);
      } else {
        insertTextAtCursor(textarea, '$$\n\n$$', '');
        const { start } = getCaretPosition(textarea);
        textarea.setSelectionRange(start - 3, start - 3);
      }
      return true;
    }
    
    // 分割线 (Ctrl+Alt+H)
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      insertTextAtCursor(textarea, '\n---\n', '');
      return true;
    }
    
    // 表格 (Ctrl+Alt+T)
    if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      const tableText = '| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容1 | 内容2 | 内容3 |';
      insertTextAtCursor(textarea, tableText, '');
      return true;
    }
    
    // 图片 (Ctrl+Alt+I)
    if (e.key === 'i' || e.key === 'I') {
      e.preventDefault();
      const altText = selectedText || '';
      insertTextAtCursor(textarea, `![${altText}]()`, '');
      // 选中 url 部分
      const { start } = getCaretPosition(textarea);
      if (altText) {
        textarea.setSelectionRange(start - 1, start - 1);
      } else {
        textarea.setSelectionRange(start - 3, start - 1);
      }
      return true;
    }
    
    return false;
  };

  // 获取光标在屏幕上的位置（简化版本）
  // 获取光标在 textarea 中的相对位置（用于 absolute 定位的菜单）
  const getCaretRelativePosition = (textarea: HTMLTextAreaElement) => {
    const { start } = getCaretPosition(textarea);
    const textBeforeCaret = textarea.value.substring(0, start);
    const lines = textBeforeCaret.split('\n');
    const currentLine = lines.length - 1;
    const lineText = lines[currentLine] || '';
    
    // 计算大概位置
    const lineHeight = 24; // 根据字体大小估算
    const charWidth = 9; // 根据字体大小估算
    const padding = 24; // padding: 1.5rem = 24px
    
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;
    
    // 计算光标在 textarea 中的相对位置（相对于 textarea 容器）
    return {
      top: currentLine * lineHeight - scrollTop + padding,
      left: lineText.length * charWidth - scrollLeft + padding
    };
  };

  // 获取光标在页面中的绝对位置（用于 fixed 定位的菜单）
  const getCaretScreenPosition = (textarea: HTMLTextAreaElement) => {
    const relativePos = getCaretRelativePosition(textarea);
    // 获取 textarea 在页面中的位置
    const textareaRect = textarea.getBoundingClientRect();
    
    // 转换为页面绝对位置
    return {
      top: textareaRect.top + relativePos.top,
      left: textareaRect.left + relativePos.left
    };
  };

  // 处理 Markdown 输入
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const newContent = textarea.value;
    const { start } = getCaretPosition(textarea);
    
    // 检测 `/` 命令
    const textBeforeCaret = newContent.substring(0, start);
    const lastSlashIndex = textBeforeCaret.lastIndexOf('/');
    const isNewLine = textBeforeCaret[lastSlashIndex - 1] === '\n' || lastSlashIndex === 0;
    
    if (lastSlashIndex !== -1 && isNewLine && start - lastSlashIndex < 20) {
      const query = textBeforeCaret.substring(lastSlashIndex + 1);
      const position = getCaretRelativePosition(textarea);
      
      setSlashIndex(lastSlashIndex);
      setCommandQuery(query);
      setCommandPosition({
        top: position.top + 30,
        left: position.left + 20
      });
      setShowCommandMenu(true);
    } else {
      setShowCommandMenu(false);
      setSlashIndex(-1);
    }
    
    onChange(newContent);
    updatePreview();
  };

  // 处理命令选择
  const handleCommandSelect = (command: Command) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const { start } = getCaretPosition(textarea);
    
    // 如果是 emoji 命令，显示 emoji 选择器
    if (command.id === 'emoji') {
      const position = getCaretScreenPosition(textarea);
      setEmojiPosition({
        top: position.top + 30,
        left: position.left + 20
      });
      setEmojiInsertIndex(start);
      setShowEmojiPicker(true);
      setShowCommandMenu(false);
      
      // 删除 `/emoji` 文本
      const beforeSlash = textarea.value.substring(0, slashIndex);
      const afterCaret = textarea.value.substring(start);
      const newValue = beforeSlash + afterCaret;
      textarea.value = newValue;
      const newCursorPos = slashIndex;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      
      onChange(newValue);
      updatePreview();
      return;
    }
    
    // 执行命令动作
    const { text, cursorOffset } = command.action();
    
    // 删除 `/` 和查询文本
    const beforeSlash = textarea.value.substring(0, slashIndex);
    const afterCaret = textarea.value.substring(start);
    const newValue = beforeSlash + text + afterCaret;
    
    textarea.value = newValue;
    const newCursorPos = slashIndex + text.length + cursorOffset;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    onChange(newValue);
    updatePreview();
    setShowCommandMenu(false);
    setSlashIndex(-1);
  };

  // 处理 Emoji 选择
  const handleEmojiSelect = (emoji: string) => {
    if (!editorRef.current || emojiInsertIndex === -1) return;
    
    const textarea = editorRef.current;
    const value = textarea.value;
    const newValue = value.substring(0, emojiInsertIndex) + emoji + value.substring(emojiInsertIndex);
    
    textarea.value = newValue;
    const newCursorPos = emojiInsertIndex + emoji.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    onChange(newValue);
    updatePreview();
    setShowEmojiPicker(false);
    setEmojiInsertIndex(-1);
    textarea.focus();
  };

  // 当主题变化时，更新自定义CSS
  useEffect(() => {
    setCustomCss(currentTheme.css);
  }, [currentTheme]);

  // 处理保存样式
  const handleSaveTheme = async () => {
    if (saveMode === 'new') {
      // 另存为新主题：需要输入 ID 和名称
      const trimmedId = newThemeId.trim();
      const trimmedName = newThemeName.trim();
      
      if (!trimmedId) {
        showToast('请输入主题 ID', { type: 'warning' });
        return;
      }
      
      if (!trimmedName) {
        showToast('请输入主题名称', { type: 'warning' });
        return;
      }
      
      // 验证 ID 格式
      const idValidation = validateThemeId(trimmedId);
      if (!idValidation.valid) {
        showToast(idValidation.error || '主题 ID 格式不正确', { type: 'warning' });
        return;
      }
      
      try {
        const newTheme = await createTheme(trimmedId, trimmedName, customCss);
        setShowSaveModal(false);
        setNewThemeId('');
        setNewThemeName('');
        setSaveMode('update');
        showToast('主题已保存', { type: 'success' });
        // 刷新主题列表并切换到新主题
        await refreshThemes();
        setTheme(newTheme.id);
      } catch (error: any) {
        console.error('保存主题失败:', error);
        showToast(error.message || '保存主题失败，请重试', { type: 'error' });
      }
    } else {
      // 更新当前主题（所有主题都支持更新，因为都在 OPFS 中）
      if (!currentThemeId) {
        showToast('无法更新主题：主题 ID 不存在', { type: 'warning' });
        return;
      }
      
      try {
        await updateTheme(currentThemeId, { css: customCss });
        setShowSaveModal(false);
        setSaveMode('update');
        showToast('主题已更新', { type: 'success' });
        // 刷新主题列表并更新当前主题
        await refreshThemes();
        setTheme(currentThemeId); // 触发主题更新
      } catch (error) {
        console.error('更新主题失败:', error);
        showToast('更新主题失败，请重试', { type: 'error' });
      }
    }
  };

  // 处理删除当前样式
  const handleDeleteCurrent = async () => {
    if (!currentThemeId) {
      showToast('无法删除主题：主题 ID 不存在', { type: 'warning' });
      return;
    }
    
    setDialog({
      isOpen: true,
      title: '确认删除',
      message: `确定要删除主题 "${currentTheme.name}" 吗？此操作不可恢复。`,
      type: 'warning',
      confirmText: '删除',
      onConfirm: async () => {
        try {
          await deleteTheme(currentThemeId);
          setDialog({ isOpen: false, title: '', message: '' });
          showToast('主题已删除', { type: 'success' });
          setShowThemeMenu(false);
          // 刷新主题列表
          await refreshThemes();
          // 切换到默认主题
          setTheme('default');
        } catch (error) {
          console.error('删除主题失败:', error);
          setDialog({ isOpen: false, title: '', message: '' });
          showToast('删除主题失败，请重试', { type: 'error' });
        }
      },
      onCancel: () => {
        setDialog({ isOpen: false, title: '', message: '' });
      },
    });
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };

    if (showThemeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showThemeMenu]);
  
  // 当打开保存Modal时，根据当前主题设置默认模式
  useEffect(() => {
    if (showSaveModal) {
      // 如果当前主题存在（所有主题都在 OPFS 中），默认选择更新；否则默认选择另存为新主题
      if (currentThemeId) {
        setSaveMode('update');
      } else {
        setSaveMode('new');
      }
      setNewThemeId('');
      setNewThemeName('');
    }
  }, [showSaveModal, currentThemeId]);

  // 应用自定义样式
  useEffect(() => {
    // 尝试获取已存在的 style 元素
    let styleElement = document.getElementById(styleIdRef.current) as HTMLStyleElement;
    
    // 如果不存在则创建新的
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleIdRef.current;
      document.head.appendChild(styleElement);
    }

    // 更新样式内容
    styleElement.textContent = customCss;
    styleRef.current = styleElement;

    // 清理函数
    return () => {
      const element = document.getElementById(styleIdRef.current);
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [customCss]);

  // 初始化内容和预览
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.value = content;
    }
    updatePreview();
  }, []);

  // 监听 content 变化
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.value) {
      editorRef.current.value = content;
      updatePreview();
    }
  }, [content]);

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* 文件路径栏 */}
      {currentFilePath && (
        <div className="flex-none px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center text-sm text-gray-600">
          <span className="text-gray-400 mr-2">📄</span>
          <span className="font-semibold text-gray-700">{filePath}</span>
        </div>
      )}
      {/* 编辑器区域 */}
      <div className="flex-1 grid overflow-hidden divide-x" style={{
        gridTemplateColumns: `${isMarkdownCollapsed ? '0fr' : '1fr'} ${isPreviewCollapsed ? '0fr' : '1fr'} ${isCssCollapsed ? '0fr' : '1fr'}`,
        height: '100%'
      }}>
        {/* Markdown 编辑区 */}
        <div className={`flex flex-col h-full overflow-hidden transition-all duration-300 relative ${isMarkdownCollapsed ? 'w-0 border-r-0' : 'border-r'}`}>
          <div className="flex-none h-10 p-2 bg-gray-50 border-b text-sm font-medium flex items-center justify-between">
            <span className="px-2 py-1 text-gray-700">
              Markdown
            </span>
            <div className="flex items-center gap-2">
              {/* 手动保存按钮 - 仅在自动保存关闭时显示 */}
              {!autoSave && currentFilePath && onSave && (
                <button
                  onClick={onSave}
                  className="p-1.5 text-blue-600 hover:bg-gray-100 rounded transition-colors"
                  title="保存文件 (Ctrl+S)"
                >
                  <Save className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  if (!editorRef.current) return;
                  const textarea = editorRef.current;
                  const { start } = getCaretPosition(textarea);
                  // 获取按钮的位置
                  const buttonRect = e.currentTarget.getBoundingClientRect();
                  const pickerWidth = 320; // emoji 选择器宽度
                  const padding = 10; // 距离屏幕边缘的最小距离
                  
                  // 计算位置，优先右对齐，如果空间不足则左对齐
                  let left = buttonRect.right - pickerWidth;
                  if (left < padding) {
                    left = buttonRect.left;
                  }
                  // 确保不超出右边界
                  if (left + pickerWidth > window.innerWidth - padding) {
                    left = window.innerWidth - pickerWidth - padding;
                  }
                  
                  setEmojiInsertIndex(start);
                  setEmojiPosition({
                    top: buttonRect.bottom + 5,
                    left: left
                  });
                  setShowEmojiPicker(true);
                }}
                className="hover:bg-gray-100 p-1.5 rounded text-lg transition-colors flex items-center justify-center"
                title="插入 Emoji"
              >
                😊
              </button>
            </div>
          </div>
          <textarea
            readOnly={readOnly}
            ref={editorRef}
            className="flex-1 min-h-0 p-6 font-mono text-[15px] leading-relaxed resize-none focus:outline-none overflow-auto markdown-editor-scrollbar bg-gray-50"
            onChange={handleInput}
            onKeyDown={(e) => {
              // 如果命令菜单显示，阻止默认行为
              if (showCommandMenu && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape')) {
                e.preventDefault();
                return;
              }
              
              // 处理格式快捷键
              if (handleFormatShortcut(e)) {
                return;
              }
            }}
            defaultValue={content}
            spellCheck={false}
            placeholder="输入 Markdown 内容，输入 / 查看快捷命令..."
          />
          
          {/* 快捷命令菜单 */}
          {showCommandMenu && (
            <SlashCommandMenu
              query={commandQuery}
              position={commandPosition}
              onSelect={handleCommandSelect}
              onClose={() => {
                setShowCommandMenu(false);
                setSlashIndex(-1);
              }}
            />
          )}
          
          {/* Emoji 选择器 */}
          {showEmojiPicker && (
            <EmojiPicker
              position={emojiPosition}
              onSelect={handleEmojiSelect}
              onClose={() => {
                setShowEmojiPicker(false);
                setEmojiInsertIndex(-1);
              }}
            />
          )}
        </div>

        {/* 预览区 */}
        <div className={`flex flex-col h-full overflow-hidden transition-all duration-300 border-l ${isPreviewCollapsed ? 'w-0 border-l-0' : ''}`}>
          <div className="flex-none h-10 p-2 bg-gray-50 border-b text-sm font-medium flex items-center">
            预览
          </div>
          <div 
            id="markmuse"
            ref={previewRef}
            className="flex-1 min-h-0 p-4 overflow-auto preview-scrollbar"
          />
        </div>

        {/* CSS 编辑区 */}
        <div className={`flex flex-col h-full overflow-hidden transition-all duration-300 border-l ${isCssCollapsed ? 'w-0 border-l-0' : ''}`}>
          <div className="flex-none h-10 p-2 bg-gray-50 border-b text-sm font-medium flex items-center justify-between">
            <span className="px-2 py-1 text-gray-700">{currentTheme.name}</span>
            <div className="flex items-center gap-2">
              {/* 保存按钮 - 只有变化时才可点击 */}
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={!hasCssChanged}
                className={`p-1.5 rounded transition-colors mr-3 ${
                  hasCssChanged
                    ? 'text-blue-600 hover:bg-gray-100 cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title={hasCssChanged ? '保存样式' : '样式未修改'}
              >
                <Save className="w-4 h-4" />
              </button>
              {/* 更多操作按钮 */}
              <div className="relative" ref={themeMenuRef}>
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                  title="更多操作"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                {showThemeMenu && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    {currentThemeId && (
                      <button
                        onClick={() => {
                          handleDeleteCurrent();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
                      >
                        删除当前样式
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <CodeMirror
              value={customCss}
              height="100%"
              theme={oneDark}
              extensions={[css()]}
              onChange={setCustomCss}
              className="h-full editor-padding"
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                foldGutter: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                searchKeymap: true,
              }}
            />
          </div>
        </div>
      </div>

      {/* Sidebar 不需要额外的包装 div */}
      <Sidebar
        getPreviewElement={() => previewRef.current}
        customCss={customCss}
        getMarkdownContent={() => editorRef.current?.value || content}
      />

      {/* 保存样式Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => {
              setShowSaveModal(false);
              setNewThemeName('');
              setSaveMode('update');
            }} 
          />
          <div 
            className="relative bg-white rounded-lg shadow-xl w-[480px] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">保存样式</h3>
            </div>
            
            {/* Content */}
            <div className="px-6 py-4">
              {/* Checkbox 选择 - 二选一（互斥） */}
              <div className="space-y-3 mb-4">
                {/* 更新主题选项 - 所有主题都支持更新 */}
                {currentThemeId ? (
                  <label 
                    className="flex items-center cursor-pointer p-3 rounded-lg border-2 transition-colors hover:bg-gray-50"
                    style={{
                      borderColor: saveMode === 'update' ? '#3b82f6' : '#e5e7eb',
                      backgroundColor: saveMode === 'update' ? '#eff6ff' : 'transparent'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setSaveMode('update');
                      setNewThemeName(''); // 切换时清空输入
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={saveMode === 'update'}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSaveMode('update');
                          setNewThemeName(''); // 切换时清空输入
                        }
                      }}
                      className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900 block">更新主题</span>
                      <span className="text-xs text-gray-500">覆盖当前主题 "{currentTheme.name}"</span>
                    </div>
                  </label>
                ) : null}
                {/* 另存为新主题选项 - 始终显示 */}
                <label 
                  className="flex items-center cursor-pointer p-3 rounded-lg border-2 transition-colors hover:bg-gray-50" 
                  style={{
                    borderColor: saveMode === 'new' ? '#3b82f6' : '#e5e7eb',
                    backgroundColor: saveMode === 'new' ? '#eff6ff' : 'transparent'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setSaveMode('new');
                  }}
                >
                  <input
                    type="checkbox"
                    checked={saveMode === 'new'}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.checked) {
                        setSaveMode('new');
                      }
                    }}
                    className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 block">另存为新主题</span>
                    <span className="text-xs text-gray-500">创建新的主题样式</span>
                  </div>
                </label>
              </div>

              {/* 新主题输入框 - 仅在选择"另存为新主题"时显示 */}
              {saveMode === 'new' && (
                <div className="mb-4 space-y-4">
                  {/* 主题 ID 输入框 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      主题 ID <span className="text-red-500">*</span>
                      <span className="ml-2 text-xs text-gray-500 font-normal">(英文、数字、-、_)</span>
                    </label>
                    <input
                      type="text"
                      value={newThemeId}
                      onChange={(e) => {
                        // 只允许输入英文、数字、-、_
                        const value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '');
                        setNewThemeId(value);
                      }}
                      placeholder="例如: wechat-simple"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newThemeId.trim() && newThemeName.trim()) {
                          handleSaveTheme();
                        } else if (e.key === 'Escape') {
                          setShowSaveModal(false);
                          setNewThemeId('');
                          setNewThemeName('');
                          setSaveMode('update');
                        } else if (e.key === 'Tab' && newThemeId.trim() && !newThemeName.trim()) {
                          // Tab 键时，如果 ID 已填，聚焦到名称输入框
                          e.preventDefault();
                          const nameInput = document.querySelector('input[placeholder="例如: 简洁微信风"]') as HTMLInputElement;
                          nameInput?.focus();
                        }
                      }}
                    />
                    {saveMode === 'new' && newThemeId && !/^[a-zA-Z0-9_-]+$/.test(newThemeId) && (
                      <p className="mt-1 text-xs text-red-500">主题 ID 只能包含英文、数字、连字符(-)和下划线(_)</p>
                    )}
                    {saveMode === 'new' && !newThemeId.trim() && (
                      <p className="mt-1 text-xs text-red-500">请输入主题 ID</p>
                    )}
                  </div>

                  {/* 主题名称输入框 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      主题名称 <span className="text-red-500">*</span>
                      <span className="ml-2 text-xs text-gray-500 font-normal">(中文/任意)</span>
                    </label>
                    <input
                      type="text"
                      value={newThemeName}
                      onChange={(e) => setNewThemeName(e.target.value)}
                      placeholder="例如: 简洁微信风"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newThemeId.trim() && newThemeName.trim()) {
                          handleSaveTheme();
                        } else if (e.key === 'Escape') {
                          setShowSaveModal(false);
                          setNewThemeId('');
                          setNewThemeName('');
                          setSaveMode('update');
                        }
                      }}
                    />
                    {saveMode === 'new' && !newThemeName.trim() && (
                      <p className="mt-1 text-xs text-red-500">请输入主题名称</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setNewThemeId('');
                  setNewThemeName('');
                  setSaveMode('update');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveTheme}
                disabled={saveMode === 'new' && (!newThemeId.trim() || !newThemeName.trim() || !/^[a-zA-Z0-9_-]+$/.test(newThemeId))}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  saveMode === 'new' && (!newThemeId.trim() || !newThemeName.trim() || !/^[a-zA-Z0-9_-]+$/.test(newThemeId))
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 对话框 */}
      <Dialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={dialog.confirmText}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
      />
    </div>
  );
} 