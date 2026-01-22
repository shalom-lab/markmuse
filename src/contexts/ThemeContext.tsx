import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { themes as builtInThemes, defaultThemeId } from '../themes';
import type { Theme } from '../types/type';
import { getSettings } from '../services/settingsStorage';
import { listThemes, ensureBuiltInThemes } from '../storage/themeStorage';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeIdOrName: string) => void;
  themes: Theme[];
  applyDefaultTheme: () => Promise<void>;
  refreshThemes: () => Promise<void>;
  isInitialized: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<string>(defaultThemeId);
  const [currentTheme, setCurrentTheme] = useState<Theme>(builtInThemes[0]);
  const [allThemes, setAllThemes] = useState<Theme[]>(builtInThemes); // 所有主题（从 OPFS 读取）
  const [isApplyingDefaultTheme, setIsApplyingDefaultTheme] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化：将内置主题导出到 OPFS，然后加载所有主题
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // 1. 确保内置主题始终存在于 OPFS
        await ensureBuiltInThemes();
        
        // 2. 从 OPFS 加载所有主题（包括内置的）
        const storedThemes = await listThemes();
        const themesFromOpfs: Theme[] = storedThemes.map(t => ({
          id: t.id,
          name: t.name,
          css: t.css
        }));

        if (mounted) {
          setAllThemes(themesFromOpfs);
          setIsInitialized(true);
          
          // 3. 应用默认主题
          const settings = await getSettings();
          const themeToApply = settings.defaultTheme || defaultThemeId;
          await applyTheme(themeToApply, themesFromOpfs);
        }
      } catch (error) {
        console.error('初始化主题失败:', error);
        // Fallback：使用代码中的内置主题
        if (mounted) {
          setAllThemes(builtInThemes);
          setIsInitialized(true);
          setCurrentTheme(builtInThemes.find(t => t.id === defaultThemeId) || builtInThemes[0]);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // 应用主题（从 OPFS 主题列表中查找）
  const applyTheme = async (themeIdOrName: string, themesList: Theme[] = allThemes) => {
    const theme = themesList.find(t => t.id === themeIdOrName || t.name === themeIdOrName);
    if (theme) {
      setCurrentThemeId(theme.id);
      setCurrentTheme(theme);
      return;
    }

    // 如果找不到，使用默认主题
    const defaultTheme = themesList.find(t => t.id === defaultThemeId) || themesList[0];
    setCurrentThemeId(defaultTheme.id);
    setCurrentTheme(defaultTheme);
  };

  const setTheme = (themeIdOrName: string) => {
    applyTheme(themeIdOrName);
  };

  // 应用默认主题（带防重复调用）
  const applyDefaultTheme = async () => {
    // 防止重复调用
    if (isApplyingDefaultTheme) {
      return;
    }

    setIsApplyingDefaultTheme(true);
    try {
      const settings = await getSettings();
      // 如果设置了默认主题，使用设置的；否则使用默认主题
      const themeToApply = settings.defaultTheme || defaultThemeId;
      await applyTheme(themeToApply);
    } catch (error) {
      console.error('应用默认主题失败:', error);
      // 出错时使用默认主题
      await applyTheme(defaultThemeId);
    } finally {
      setIsApplyingDefaultTheme(false);
    }
  };

  // 刷新主题列表（当主题被创建/更新/删除后调用）
  const refreshThemes = async () => {
    try {
      const storedThemes = await listThemes();
      const themesFromOpfs: Theme[] = storedThemes.map(t => ({
        id: t.id,
        name: t.name,
        css: t.css
      }));
      setAllThemes(themesFromOpfs);
      
      // 如果当前主题被删除，切换到默认主题
      const currentExists = themesFromOpfs.some(t => t.id === currentThemeId || t.name === currentTheme.name);
      if (!currentExists) {
        await applyTheme(defaultThemeId, themesFromOpfs);
      } else {
        // 刷新当前主题（可能被更新了）
        await applyTheme(currentThemeId, themesFromOpfs);
      }
    } catch (error) {
      console.error('刷新主题列表失败:', error);
    }
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        currentTheme, 
        setTheme, 
        themes: allThemes, 
        applyDefaultTheme,
        refreshThemes,
        isInitialized
      }}
    >
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

