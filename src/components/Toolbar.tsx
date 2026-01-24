import { useState, useRef, useEffect, useMemo } from 'react';
import Logo from './Logo';
import { useTheme } from '../contexts/ThemeContext';
import { themes as builtInThemes } from '../themes';

interface FormatItem {
  label: string;
  shortcut: string;
  category?: string;
}

interface Props {
  isMarkdownVisible: boolean;
  isPreviewVisible: boolean;
  isCssVisible: boolean;
  isSettingsVisible: boolean;
  onMarkdownToggle: (visible: boolean) => void;
  onPreviewToggle: (visible: boolean) => void;
  onCssToggle: (visible: boolean) => void;
  onSettingsToggle: (visible: boolean) => void;
  onFormatAction?: (shortcut: string) => void;
  onOpenThemeManage?: () => void;
  onOpenHelp?: () => void;
}

export default function Toolbar({
  isMarkdownVisible,
  isPreviewVisible,
  isCssVisible,
  isSettingsVisible,
  onMarkdownToggle,
  onPreviewToggle,
  onCssToggle,
  onSettingsToggle,
  onFormatAction,
  onOpenThemeManage,
  onOpenHelp
}: Props) {
  const { currentTheme, setTheme, themes } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const formatMenuRef = useRef<HTMLDivElement>(null);

  // 计算内置主题和自定义主题
  const { builtInThemesList, customThemes } = useMemo(() => {
    const builtInThemeIds = new Set(builtInThemes.map(t => t.id));
    return {
      builtInThemesList: themes.filter(t => builtInThemeIds.has(t.id)),
      customThemes: themes.filter(t => !builtInThemeIds.has(t.id))
    };
  }, [themes]);

  // 格式功能列表
  const formatItems: FormatItem[] = [
    // 标题
    { label: '一级标题', shortcut: 'Ctrl+1', category: '标题' },
    { label: '二级标题', shortcut: 'Ctrl+2', category: '标题' },
    { label: '三级标题', shortcut: 'Ctrl+3', category: '标题' },
    { label: '四级标题', shortcut: 'Ctrl+4', category: '标题' },
    { label: '五级标题', shortcut: 'Ctrl+5', category: '标题' },
    { label: '六级标题', shortcut: 'Ctrl+6', category: '标题' },
    // 基础文本格式
    { label: '删除线', shortcut: 'Ctrl+Alt+X', category: '基础文本格式' },
    { label: '加粗', shortcut: 'Ctrl+B', category: '基础文本格式' },
    { label: '倾斜', shortcut: 'Ctrl+I', category: '基础文本格式' },
    { label: '下划线', shortcut: 'Ctrl+U', category: '基础文本格式' },
    { label: '行内代码', shortcut: 'Ctrl+E', category: '基础文本格式' },
    { label: '行内公式', shortcut: 'Ctrl+M', category: '基础文本格式' },
    // 块级元素
    { label: '引用', shortcut: 'Ctrl+Alt+Q', category: '块级元素' },
    { label: '有序列表', shortcut: 'Ctrl+Alt+O', category: '块级元素' },
    { label: '无序列表', shortcut: 'Ctrl+Alt+U', category: '块级元素' },
    { label: '代码块', shortcut: 'Ctrl+Alt+E', category: '块级元素' },
    { label: '公式块', shortcut: 'Ctrl+Alt+M', category: '块级元素' },
    { label: '分割线', shortcut: 'Ctrl+Alt+H', category: '块级元素' },
    // 媒体与链接
    { label: '链接', shortcut: 'Ctrl+K', category: '媒体与链接' },
    { label: '表格', shortcut: 'Ctrl+Alt+T', category: '媒体与链接' },
    { label: '图片', shortcut: 'Ctrl+Alt+I', category: '媒体与链接' },
  ];

  // 按分类分组
  const groupedItems = formatItems.reduce((acc, item) => {
    const category = item.category || '其他';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, FormatItem[]>);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
        setIsViewMenuOpen(false);
      }
      if (formatMenuRef.current && !formatMenuRef.current.contains(event.target as Node)) {
        setIsFormatMenuOpen(false);
      }
    }

    if (isThemeMenuOpen || isViewMenuOpen || isFormatMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isThemeMenuOpen, isViewMenuOpen, isFormatMenuOpen]);

  return (
    <div className="h-12 border-b border-gray-200 flex items-center px-4 justify-between bg-white">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Logo />
          <a
            href="https://github.com/shalom-lab/markmuse"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-700 hover:text-blue-600 cursor-pointer transition-colors"
            title="打开 GitHub 仓库"
          >
            MarkMuse
          </a>
        </div>
        <nav className="flex items-center space-x-4">
          {/* <button className="px-2 py-1 hover:bg-gray-100 rounded">
            文件
          </button> */}
          
          {/* 格式菜单 */}
          <div className="relative" ref={formatMenuRef}>
            <button
              onClick={() => setIsFormatMenuOpen(!isFormatMenuOpen)}
              className="px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-1"
            >
              格式
              <svg
                className={`w-4 h-4 transition-transform ${isFormatMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isFormatMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[calc(100vh-80px)] overflow-y-auto">
                {Object.entries(groupedItems).map(([category, items], categoryIndex) => (
                  <div key={category}>
                    {categoryIndex > 0 && <div className="border-t border-gray-200 my-1"></div>}
                    {items.map((item, index) => (
                      <button
                        key={`${category}-${index}`}
                        onClick={() => {
                          if (onFormatAction) {
                            onFormatAction(item.shortcut);
                          }
                          setIsFormatMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">{item.label}</span>
                        <span className="text-xs text-gray-400 font-sans tracking-wide">{item.shortcut}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 主题按钮 */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-1"
            >
              主题
              <svg
                className={`w-4 h-4 transition-transform ${isThemeMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isThemeMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[calc(100vh-100px)] overflow-y-auto">
                {/* 内置主题 */}
                {builtInThemesList.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                      currentTheme.id === theme.id ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <span>{theme.name}</span>
                    {currentTheme.id === theme.id && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
                
                {/* 分隔线 - 如果有自定义主题，显示分隔线 */}
                {builtInThemesList.length > 0 && customThemes.length > 0 && (
                  <div className="border-t border-gray-200 my-1"></div>
                )}
                
                {/* 自定义主题 */}
                {customThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                      currentTheme.id === theme.id ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <span>{theme.name}</span>
                    {currentTheme.id === theme.id && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
                
                {/* 分割线 */}
                <div className="border-t border-gray-200 my-1"></div>
                
                {/* 主题管理 */}
                <button
                  onClick={() => {
                    setIsThemeMenuOpen(false);
                    if (onOpenThemeManage) {
                      onOpenThemeManage();
                    }
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>主题管理</span>
                </button>
              </div>
            )}
          </div>

          {/* 视图菜单 - 控制区域显示 */}
          <div className="relative" ref={viewMenuRef}>
            <button
              onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
              className="px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-1"
            >
              视图
              <svg
                className={`w-4 h-4 transition-transform ${isViewMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isViewMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <button
                onClick={() => onMarkdownToggle(!isMarkdownVisible)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                  isMarkdownVisible ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <span>编辑区</span>
                {isMarkdownVisible && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => onPreviewToggle(!isPreviewVisible)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                  isPreviewVisible ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <span>预览区</span>
                {isPreviewVisible && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => onCssToggle(!isCssVisible)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                  isCssVisible ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <span>样式区</span>
                {isCssVisible && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              </div>
            )}
          </div>

          {/* <button className="px-2 py-1 hover:bg-gray-100 rounded">
            功能
          </button> */}
          <button 
            onClick={() => {
              if (onOpenHelp) {
                onOpenHelp();
              }
            }}
            className="px-2 py-1 hover:bg-gray-100 rounded"
          >
            帮助
          </button>
          {/* <button className="px-2 py-1 hover:bg-gray-100 rounded">
            教程
          </button> */}
          
          {/* 设置按钮 */}
          <button
            onClick={() => {
              onSettingsToggle(!isSettingsVisible);
            }}
            className={`px-2 py-1 hover:bg-gray-100 rounded flex items-center gap-1 ${
              isSettingsVisible ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <span>设置</span>
          </button>
        </nav>
      </div>
    </div>
  );
} 