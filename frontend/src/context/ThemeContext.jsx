import { createContext, useState, useEffect } from 'react';

 
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
   
  const getInitialTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved; 

     
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark'; 
  };

  const [theme, setTheme] = useState(getInitialTheme);

   
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme;   
  }, [theme]);

   
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
       
      const userManuallySet = localStorage.getItem('themeManuallySet');
      if (!userManuallySet) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

   
  const toggleTheme = () => {
    localStorage.setItem('themeManuallySet', 'true');  
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};