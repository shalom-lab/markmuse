import { useState, useEffect, useRef } from 'react';
import type { Command } from '../types/type';

const commands: Command[] = [
  {
    id: 'emoji',
    label: '表情符号',
    icon: '😀',
    keywords: ['emoji', '表情', 'emotion', '图标'],
    action: () => {
      // 这个会触发 emoji 选择器
      return { text: '', cursorOffset: 0 };
    }
  },
  {
    id: 'h1',
    label: '一级标题',
    icon: 'H1',
    keywords: ['h1', '标题1', 'heading1'],
    action: () => {
      const text = '\n# ';
      return { text, cursorOffset: text.length };
    }
  },
  {
    id: 'h2',
    label: '二级标题',
    icon: 'H2',
    keywords: ['h2', '标题2', 'heading2'],
    action: () => {
      const text = '\n## ';
      return { text, cursorOffset: text.length };
    }
  },
  {
    id: 'h3',
    label: '三级标题',
    icon: 'H3',
    keywords: ['h3', '标题3', 'heading3'],
    action: () => {
      const text = '\n### ';
      return { text, cursorOffset: text.length };
    }
  },
  {
    id: 'blockquote',
    label: '引用块',
    icon: '❝',
    keywords: ['quote', '引用', 'blockquote'],
    action: () => {
      const text = '\n> ';
      return { text, cursorOffset: text.length };
    }
  },
  {
    id: 'code',
    label: '代码块',
    icon: '</>',
    keywords: ['code', '代码', 'codeblock'],
    action: () => {
      const text = '\n```\n\n```';
      return { text, cursorOffset: 5 };
    }
  },
  {
    id: 'list',
    label: '无序列表',
    icon: '•',
    keywords: ['list', '列表', 'ul'],
    action: () => {
      const text = '\n- ';
      return { text, cursorOffset: text.length };
    }
  },
  {
    id: 'ordered-list',
    label: '有序列表',
    icon: '1.',
    keywords: ['ol', '有序列表', 'numbered'],
    action: () => {
      const text = '\n1. ';
      return { text, cursorOffset: text.length };
    }
  },
  {
    id: 'table',
    label: '表格',
    icon: '⊞',
    keywords: ['table', '表格'],
    action: () => {
      const text = '\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n|     |     |     |';
      return { text, cursorOffset: 7 };
    }
  },
  {
    id: 'divider',
    label: '分隔线',
    icon: '---',
    keywords: ['hr', '分隔线', 'divider'],
    action: () => {
      const text = '\n---\n';
      return { text, cursorOffset: text.length };
    }
  }
];

interface Props {
  query: string;
  position: { top: number; left: number };
  onSelect: (command: Command) => void;
  onClose: () => void;
}

export default function SlashCommandMenu({ query, position, onSelect, onClose }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // 过滤命令
  const filteredCommands = commands.filter(cmd => {
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    return cmd.keywords.some(kw => kw.toLowerCase().includes(lowerQuery)) ||
           cmd.label.toLowerCase().includes(lowerQuery);
  });

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredCommands, onSelect, onClose]);

  // 重置选中索引当过滤结果变化时
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, filteredCommands.length]);

  if (filteredCommands.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="absolute bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: '200px'
      }}
    >
      {filteredCommands.map((cmd, index) => (
        <button
          key={cmd.id}
          onClick={() => onSelect(cmd)}
          className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-100 ${
            index === selectedIndex ? 'bg-blue-50 text-blue-600' : ''
          }`}
        >
          <span className="text-lg">{cmd.icon}</span>
          <span className="flex-1">{cmd.label}</span>
        </button>
      ))}
    </div>
  );
}

export { commands };

