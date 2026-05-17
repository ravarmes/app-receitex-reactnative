import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { LightColors, DarkColors, AppColors } from '../utils/colors';

const THEME_STORAGE_KEY = '@theme_mode';

type ThemeContextData = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: AppColors;
  paperTheme: typeof MD3LightTheme;
};

const lightPaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0E7C78',
    background: '#F5F7F7',
    surface: '#FFFFFF',
    onBackground: '#1e293b',
    onSurface: '#1e293b',
    surfaceVariant: '#DDEEED',
    onSurfaceVariant: '#475569',
    secondaryContainer: '#DDEEED',
    onSecondaryContainer: '#075454',
  },
};

const darkPaperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#1FA899',
    background: '#0F1117',
    surface: '#1A1D27',
    onBackground: '#E2E8F0',
    onSurface: '#E2E8F0',
    surfaceVariant: '#1A3A38',
    onSurfaceVariant: '#94A3B8',
    secondaryContainer: '#1A3A38',
    onSecondaryContainer: '#5EEAD4',
  },
};

const ThemeContext = createContext<ThemeContextData>({
  isDark: false,
  toggleTheme: () => {},
  colors: LightColors,
  paperTheme: lightPaperTheme,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(val => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
  };

  const value = useMemo(() => ({
    isDark,
    toggleTheme,
    colors: isDark ? DarkColors : LightColors,
    paperTheme: isDark ? darkPaperTheme : lightPaperTheme,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeContext);
