import { useState, useEffect, useRef } from 'react';

const emojiCategories = [
  {
    name: '常用',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏']
  },
  {
    name: '手势',
    emojis: ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏']
  },
  {
    name: '物品',
    emojis: ['📱', '💻', '⌚', '📷', '🎥', '📺', '📻', '🎙', '🎚', '🎛', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖', '🛠', '🔨', '⚒', '🛠', '🔧', '🔩', '⚙', '🔫', '💣', '🔪', '🗡', '⚔', '🛡', '🚬', '⚰', '⚱', '🏺']
  },
  {
    name: '心形',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟']
  },
  {
    name: '标记',
    emojis: ['✅', '❌', '⭕', '✔', '☑', '❎', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼', '⁉', '🔅', '🔆', '〽', '⚠', '🚸', '🔱', '⚜', '🔰', '♻', '🈯', '💹', '❇', '✳', '🌐', '💠', 'Ⓜ', '🌀', '💤']
  },
  {
    name: '箭头',
    emojis: ['▶', '⏸', '⏯', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '🔀', '🔁', '🔂', '🔄', '🔃', '🔚', '🔙', '🔛', '🔜', '🔝', '🔺', '🔻', '⬆', '⬇', '⬅', '➡', '↗', '↖', '↘', '↙', '↕', '↔']
  },
  {
    name: '数字',
    emojis: ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '➕', '➖', '➗', '✖', '💲', '💱', '™', '©', '®']
  },
  {
    name: '形状',
    emojis: ['🔘', '⚪', '⚫', '🔴', '🔵', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪', '▫', '◾', '◽', '◼', '◻', '⬛', '⬜', '〰', '➰', '➿']
  },
  {
    name: '声音',
    emojis: ['🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁‍🗨', '💬', '💭', '🗯', '🎵', '🎶']
  },
  {
    name: '卡片',
    emojis: ['♠', '♣', '♥', '♦', '🃏', '🎴', '🀄']
  },
  {
    name: '时间',
    emojis: ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧']
  },
  {
    name: '日文',
    emojis: ['🆔', '⚛', '🉑', '☢', '☣', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷', '✴', '🆚', '💮', '🉐', '㊙', '㊗', '🈴', '🈵', '🈹', '🈲', '🅰', '🅱', '🆎', '🆑', '🅾', '🆘', '🏧', '🚾', '♿', '🅿', '🈳', '🈂', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓']
  },
  {
    name: '宗教',
    emojis: ['☮', '✝', '☪', '🕉', '☸', '✡', '🔯', '🕎', '☯', '☦', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']
  }
];

interface Props {
  position: { top: number; left: number };
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ position, onSelect, onClose }: Props) {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // 调整位置，确保不超出屏幕边界
  useEffect(() => {
    if (!pickerRef.current) return;

    const pickerWidth = 320; // w-80 = 320px
    const pickerHeight = 384; // max-h-96 = 384px
    const padding = 10; // 距离屏幕边缘的最小距离

    let adjustedTop = position.top;
    let adjustedLeft = position.left;

    // 检查右边界
    if (adjustedLeft + pickerWidth > window.innerWidth - padding) {
      adjustedLeft = window.innerWidth - pickerWidth - padding;
    }

    // 检查左边界
    if (adjustedLeft < padding) {
      adjustedLeft = padding;
    }

    // 检查下边界
    if (adjustedTop + pickerHeight > window.innerHeight - padding) {
      // 如果下方空间不足，尝试显示在上方
      adjustedTop = position.top - pickerHeight - 10;
      // 如果上方也不够，就显示在屏幕顶部
      if (adjustedTop < padding) {
        adjustedTop = padding;
      }
    }

    // 检查上边界
    if (adjustedTop < padding) {
      adjustedTop = padding;
    }

    setAdjustedPosition({ top: adjustedTop, left: adjustedLeft });
  }, [position]);

  return (
    <div
      ref={pickerRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[100] w-80 max-h-96 flex flex-col"
      style={{
        top: `${adjustedPosition.top}px`,
        left: `${adjustedPosition.left}px`
      }}
    >
      {/* 分类标签 */}
      <div className="flex border-b border-gray-200 p-2 gap-1 overflow-x-auto scrollbar-hide">
        {emojiCategories.map((cat, index) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(index)}
            className={`px-2 py-1 rounded text-xs whitespace-nowrap flex-shrink-0 ${
              selectedCategory === index ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Emoji 网格 */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-8 gap-2">
          {emojiCategories[selectedCategory].emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => onSelect(emoji)}
              className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

