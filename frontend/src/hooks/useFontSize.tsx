import { useEffect, useState } from 'react';

type FontSizeType = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Hook to manage the font size of the application.
 * Gets the initial font size from localStorage and updates it as needed.
 */
export const useFontSize = () => {
  // Initialize from localStorage or default to 'md'
  const getInitialFontSize = (): FontSizeType => {
    if (typeof window !== 'undefined') {
      const storedFontSize = localStorage.getItem('fontSize');
      if (storedFontSize && ['sm', 'md', 'lg', 'xl'].includes(storedFontSize)) {
        return storedFontSize as FontSizeType;
      }
    }
    return 'md';
  };
  
  const [fontSize, setFontSize] = useState<FontSizeType>(getInitialFontSize);
  
  // Set fontSize in DOM and localStorage
  const applyFontSize = (newFontSize: FontSizeType) => {
    // Remove all current font size classes
    document.documentElement.classList.remove('text-sm', 'text-md', 'text-lg', 'text-xl');
    
    // Add the new font size class
    document.documentElement.classList.add(`text-${newFontSize}`);
    
    // Save to localStorage
    localStorage.setItem('fontSize', newFontSize);
  };
  
  // Initialize font size on load
  useEffect(() => {
    applyFontSize(fontSize);
  }, []);
  
  // Function to set the font size
  const setFontSizeValue = (newFontSize: FontSizeType) => {
    setFontSize(newFontSize);
    applyFontSize(newFontSize);
  };
  
  return { fontSize, setFontSize: setFontSizeValue };
};
