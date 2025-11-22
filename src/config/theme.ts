/**
 * Theme configuration for VAL Builder
 * Easily customize colors and styling here
 */

export const theme = {
  colors: {
    primary: '#8BC34A',      // Main green color
    primaryDark: '#7CB342',  // Darker green for hover states
    primaryLight: '#C5E1A5', // Light green for backgrounds
    
    background: '#FFFFFF',
    backgroundAlt: '#F5F5F5',
    
    text: {
      primary: '#333333',
      secondary: '#666666',
      light: '#999999',
    },
    
    border: '#DDDDDD',
    borderLight: '#E8E8E8',
    
    section: {
      background: '#E8F5E9',  // Light green for section cards
      border: '#C5E1A5',
    },
    
    button: {
      primary: '#8BC34A',
      primaryHover: '#7CB342',
      secondary: '#F5F5F5',
      secondaryHover: '#E0E0E0',
    },
    
    editor: {
      background: '#FFFFFF',
      border: '#DDDDDD',
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 2px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
};

export type Theme = typeof theme;
