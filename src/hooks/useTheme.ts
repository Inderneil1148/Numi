import { useState, useEffect, useCallback } from 'react';
import { ThemeMode } from '../types/finance';
import { loadStoredTheme, saveStoredTheme } from '../utils/storage';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => loadStoredTheme());
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const isDark = theme === 'dark' || (theme === 'system' && systemIsDark);

  const applyTheme = useCallback((dark: boolean) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', dark ? '#000000' : '#F2F2F7');
    }

    const appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (appleStatusBarMeta) {
      appleStatusBarMeta.setAttribute('content', dark ? 'black-translucent' : 'default');
    }
  }, []);

  // Listen to OS system prefers-color-scheme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    setSystemIsDark(mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Update DOM when effective isDark state changes
  useEffect(() => {
    applyTheme(isDark);
  }, [isDark, applyTheme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    saveStoredTheme(newTheme);
  }, []);

  return {
    theme,
    setTheme,
    isDark,
  };
}
