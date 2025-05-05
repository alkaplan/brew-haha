import { createContext, useState, useContext, useEffect } from 'react';

// Define theme colors and styles
const themes = {
  default: {
    primary: '#6b4f1d',
    secondary: '#b91c1c',
    background: '#fffbe7',
    cardBackground: '#fff',
    accent: '#e0cba8',
    accentLight: '#f7ecd7',
    fonts: 'sans-serif',
    buttonBackground: '#6b4f1d',
    buttonText: '#fffbe7',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    emoji: '☕'
  },
  mom: {
    primary: '#d23f85', // Pink
    secondary: '#8a3f8f', // Purple
    background: '#fff2f9', // Light pink
    cardBackground: '#fff',
    accent: '#fca5cf', // Lighter pink
    accentLight: '#ffdbee', // Very light pink
    fonts: 'sans-serif',
    buttonBackground: '#d23f85',
    buttonText: '#fff',
    boxShadow: '0 4px 12px rgba(214,129,179,0.2)',
    emoji: '🌸'
  }
};

// Create the context
export const ThemeContext = createContext();

// Theme provider component
export function ThemeProvider({ children }) {
  const [isMomMode, setIsMomMode] = useState(false);
  
  // Check if mom mode was previously enabled when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedIsMomMode = localStorage.getItem('coffeeHouseIsMomMode') === 'true';
      setIsMomMode(savedIsMomMode);
    }
  }, []);
  
  // Toggle mom mode function
  const toggleMomMode = (value) => {
    const newValue = typeof value === 'boolean' ? value : !isMomMode;
    setIsMomMode(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('coffeeHouseIsMomMode', newValue.toString());
    }
  };
  
  // Get the current theme
  const currentTheme = isMomMode ? themes.mom : themes.default;
  
  return (
    <ThemeContext.Provider value={{ 
      theme: currentTheme, 
      isMomMode, 
      toggleMomMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  return useContext(ThemeContext);
} 