import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ThemeMode = "light" | "dark";
type MoodTheme = "default" | "calm" | "energetic" | "focused";

interface ThemeContextType {
  theme: ThemeMode;
  moodTheme: MoodTheme;
  toggleTheme: () => void;
  setMoodTheme: (mood: MoodTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const [moodTheme, setMoodTheme] = useState<MoodTheme>(() => {
    const savedMood = localStorage.getItem("moodTheme") as MoodTheme;
    return savedMood || "default";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("moodTheme", moodTheme);
    
    // Remove previous mood classes
    document.documentElement.classList.remove("mood-default", "mood-calm", "mood-energetic", "mood-focused");
    
    // Add current mood class
    document.documentElement.classList.add(`mood-${moodTheme}`);
    
    // Apply CSS variables for mood themes
    const root = document.documentElement;
    
    if (moodTheme === "calm") {
      root.style.setProperty("--primary-hue", "220"); // Blue
    } else if (moodTheme === "energetic") {
      root.style.setProperty("--primary-hue", "25"); // Orange
    } else if (moodTheme === "focused") {
      root.style.setProperty("--primary-hue", "160"); // Green
    } else {
      root.style.setProperty("--primary-hue", "252"); // Default purple
    }
  }, [moodTheme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        moodTheme, 
        toggleTheme, 
        setMoodTheme 
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
