import { createContext, useState, useEffect } from 'react';

// Context banaya
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Pehle check karega ki local storage me kya save hai, default 'dark' rakhega
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Jab bhi theme change hoga, ye function chalega
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme; // Body tag me class lagayega (.dark ya .light)
  }, [theme]);

  // Theme switch karne ka function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};