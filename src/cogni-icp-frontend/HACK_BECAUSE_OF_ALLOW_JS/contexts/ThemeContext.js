import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
const ThemeContext = createContext(undefined);
export const ThemeProvider = ({ children }) => {
    // Track if the user has explicitly chosen a theme
    const userSetTheme = useRef(false);
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            userSetTheme.current = true;
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    const [theme, setTheme] = useState(getInitialTheme);
    // Listen for device theme changes
    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (!userSetTheme.current) {
                setTheme(media.matches ? 'dark' : 'light');
            }
        };
        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, []);
    // Apply theme to document
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);
    // Only set localStorage if user toggles theme
    const toggleTheme = () => {
        setTheme(prev => {
            const next = prev === 'light' ? 'dark' : 'light';
            userSetTheme.current = true;
            localStorage.setItem('theme', next);
            return next;
        });
    };
    return (<ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>);
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
