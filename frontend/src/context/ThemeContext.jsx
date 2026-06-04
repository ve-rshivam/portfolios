import { createContext, useState, useEffect } from 'react';

// Context banaya
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Smart Default: Check localStorage first, then system preference, then fallback to 'dark'
  const getInitialTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved; // User's manual choice takes priority

    // Detect system/device preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark'; // Default fallback
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Jab bhi theme change hoga, ye function chalega
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme; // Body tag me class lagayega (.dark ya .light)
  }, [theme]);

  // Listen to system theme changes (only if user hasn't manually set a preference)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      // Only auto-switch if user hasn't manually toggled (check via a flag)
      const userManuallySet = localStorage.getItem('themeManuallySet');
      if (!userManuallySet) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Theme switch karne ka function (manual toggle)
  const toggleTheme = () => {
    localStorage.setItem('themeManuallySet', 'true'); // Mark as manually set
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};