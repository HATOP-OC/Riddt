import { create } from 'zustand';
import { Appearance, ColorSchemeName } from 'react-native';
import { lightTheme, darkTheme, Theme } from '@/theme/colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  colorScheme: ColorSchemeName;
  theme: Theme;
  
  // Actions
  setMode: (mode: ThemeMode) => void;
  initialize: () => void;
}

const getSystemColorScheme = (): ColorSchemeName => {
  return Appearance.getColorScheme() || 'light';
};

const getThemeFromScheme = (colorScheme: ColorSchemeName): Theme => {
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  colorScheme: getSystemColorScheme(),
  theme: getThemeFromScheme(getSystemColorScheme()),
  
  setMode: (mode: ThemeMode) => {
    let colorScheme: ColorSchemeName;
    
    if (mode === 'system') {
      colorScheme = getSystemColorScheme();
    } else {
      colorScheme = mode;
    }
    
    set({
      mode,
      colorScheme,
      theme: getThemeFromScheme(colorScheme),
    });
  },
  
  initialize: () => {
    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      const currentMode = get().mode;
      if (currentMode === 'system') {
        set({
          colorScheme,
          theme: getThemeFromScheme(colorScheme),
        });
      }
    });
    
    // Initial setup
    const mode = get().mode;
    const colorScheme = mode === 'system' ? getSystemColorScheme() : mode;
    set({
      colorScheme,
      theme: getThemeFromScheme(colorScheme),
    });
  },
}));
