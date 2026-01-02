import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { themes, defaultThemeId, Theme } from '../themes';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getSettings } from '../services/settingsStorage';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeIdOrName: string) => void;
  themes: Theme[];
  applyDefaultTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<string>(defaultThemeId);
  const [customTheme, setCustomTheme] = useState<{ name: string; css: string } | null>(null);
  
  // 获取自定义主题列表
  const customThemes = useLiveQuery(() => db.themes.filter(theme => theme.isCustom === true).toArray());
  
  // 确定当前主题
  const currentTheme: Theme = (() => {
    // 如果设置了自定义主题，使用自定义主题
    if (customTheme) {
      return {
        id: customTheme.name,
        name: customTheme.name,
        css: customTheme.css
      };
    }
    // 否则使用内置主题
    return themes.find(t => t.id === currentThemeId) || themes[0];
  })();
  
  const setTheme = (themeIdOrName: string) => {
    // 先检查是否是内置主题
    const builtInTheme = themes.find(t => t.id === themeIdOrName);
    if (builtInTheme) {
      setCurrentThemeId(themeIdOrName);
      setCustomTheme(null);
      return;
    }
    
    // 如果不是内置主题，查找自定义主题
    if (customThemes) {
      const customTheme = customThemes.find(t => t.name === themeIdOrName);
      if (customTheme) {
        setCustomTheme({ name: customTheme.name, css: customTheme.css });
        setCurrentThemeId(''); // 清空内置主题 ID
        return;
      }
    }
    
    // 如果都找不到，使用默认主题
    setCurrentThemeId(defaultThemeId);
    setCustomTheme(null);
  };

  // 应用默认主题
  const applyDefaultTheme = async () => {
    try {
      const settings = await getSettings();
      // 如果设置了默认主题，使用设置的；否则使用内置的默认主题
      const themeToApply = settings.defaultTheme || defaultThemeId;
      setTheme(themeToApply);
    } catch (error) {
      console.error('应用默认主题失败:', error);
      // 出错时使用内置的默认主题
      setTheme(defaultThemeId);
    }
  };

  // 初始化时应用默认主题
  useEffect(() => {
    applyDefaultTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes, applyDefaultTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

