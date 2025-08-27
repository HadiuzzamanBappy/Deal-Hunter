import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or OS preference
  const getInitialTheme = () => {
    const stored = window.localStorage.getItem('theme');
    if (stored) return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  };
  const [theme, setTheme] = useState(getInitialTheme);
  const syncHtmlClass = (themeValue) => {
    if (themeValue === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  React.useEffect(() => {
    syncHtmlClass(theme);
    window.localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      syncHtmlClass(newTheme);
      window.localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
