import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Charger le thème depuis le localStorage au chargement
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedSidebarState = localStorage.getItem('sidebarCollapsed') === 'true';
    
    setTheme(savedTheme);
    setSidebarCollapsed(savedSidebarState);
    
    // Appliquer le thème au body
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  // Basculer entre les thèmes clair et sombre
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  // Définir un thème spécifique
  const setSpecificTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  // Basculer l'état de la sidebar
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState);
  };

  // Définir l'état de la sidebar
  const setSidebarState = (collapsed) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebarCollapsed', collapsed);
  };

  const value = {
    theme,
    toggleTheme,
    setSpecificTheme,
    isDarkMode: theme === 'dark',
    sidebarCollapsed,
    toggleSidebar,
    setSidebarState,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};