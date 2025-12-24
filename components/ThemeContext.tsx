import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';

type Theme = 'slate' | 'dark' | 'light';

export const SYNTAX_TOKEN_MAP: Record<string, string> = {
  'keyword': 'Keywords',
  'dataType': 'Data Types',
  'string': 'Strings',
  'number': 'Numbers',
  'operator': 'Operators',
  'identifier': 'Identifiers',
  'comment': 'Comments',
  'builtin': 'Built-in Functions',
};

const SYNTAX_TOKENS = Object.keys(SYNTAX_TOKEN_MAP);

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getSyntaxColor: (token: string) => string;
  setCustomColorProperty: (token: string, color: string) => void;
  resetCustomColors: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('slate');
  const [customColors, setCustomColors] = useState<Record<string, string>>({});

  // Effect to load the initial theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || 'slate';
    setThemeState(initialTheme);
  }, []);

  // Effect to apply theme and custom colors whenever theme changes
  useEffect(() => {
    // 1. Clear any existing inline styles to prevent color bleed between themes
    SYNTAX_TOKENS.forEach(token => {
      document.documentElement.style.removeProperty(`--syntax-${token}`);
    });

    // 2. Set the data-theme attribute for base styles
    document.documentElement.setAttribute('data-theme', theme);
    
    // 3. Load and apply custom colors for the new theme
    try {
      const savedColors = JSON.parse(localStorage.getItem(`custom-colors-${theme}`) || '{}');
      setCustomColors(savedColors);
      Object.entries(savedColors).forEach(([token, color]) => {
        document.documentElement.style.setProperty(`--syntax-${token}`, color as string);
      });
    } catch (error) {
        console.error("Failed to load custom colors from localStorage:", error);
        setCustomColors({});
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };
  
  const setCustomColorProperty = (token: string, color: string) => {
    const newColors = { ...customColors, [token]: color };
    setCustomColors(newColors);
    try {
        localStorage.setItem(`custom-colors-${theme}`, JSON.stringify(newColors));
    } catch (error) {
        console.error("Failed to save custom colors to localStorage:", error);
    }
    document.documentElement.style.setProperty(`--syntax-${token}`, color);
  };

  const resetCustomColors = useCallback(() => {
    try {
        localStorage.removeItem(`custom-colors-${theme}`);
    } catch (error) {
        console.error("Failed to remove custom colors from localStorage:", error);
    }
    setCustomColors({});
    SYNTAX_TOKENS.forEach(token => {
      document.documentElement.style.removeProperty(`--syntax-${token}`);
    });
  }, [theme]);

  const getSyntaxColor = useCallback((token: string) => {
      const customColor = customColors[token];
      if (customColor) {
          return customColor;
      }
      // Fallback to the computed style from the CSS file
      return getComputedStyle(document.documentElement).getPropertyValue(`--syntax-${token}`).trim();
  }, [customColors]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getSyntaxColor, setCustomColorProperty, resetCustomColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};