import React, { useEffect } from 'react';
import config from '../config.json';

const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Set CSS variables based on config
    const root = document.documentElement;
    root.style.setProperty('--background', config.colorScheme.background);
    root.style.setProperty('--foreground', config.colorScheme.foreground);
    root.style.setProperty('--accent', config.colorScheme.accent);
  }, []);

  return children;
};

export default ThemeProvider;