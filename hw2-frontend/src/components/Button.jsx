// components/Button.jsx
// A reusable button component with loading state
import React from 'react';
import { useContext } from 'react';
import { ThemeContext } from '../DarkLightMood/ThemeContext';



const Button = ({ 
  children, 
  type = 'button', 
  onClick, 
  isLoading = false,
  disabled = false,
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  fullWidth = false,
  className = ''
}) => {
  const { theme } = useContext(ThemeContext); // Get current theme
  const isDark = theme === 'dark';            // Boolean for dark mode

  // Define variant styles based on type and theme
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        // Blue button for primary actions
        return `${isDark 
          ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
          : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'} text-white`;
      case 'secondary':
        // Gray button for secondary actions
        return `${isDark 
          ? 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500' 
          : 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-400'} ${isDark ? 'text-white' : 'text-gray-900'}`;
      case 'danger':
        // Red button for destructive actions
        return `${isDark 
          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
          : 'bg-red-500 hover:bg-red-600 focus:ring-red-500'} text-white`;
      default:
        // Default to primary style
        return `${isDark 
          ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
          : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'} text-white`;
    }
  };

  return (
    // Button element with dynamic styles and states
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled} // Disable if loading or disabled
      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
        ${getVariantStyles()} 
        ${isLoading || disabled ? 'opacity-70 cursor-not-allowed' : ''}
        ${fullWidth ? 'w-full' : ''}
        focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out
        ${className}`}
    >
      {/* Show spinner and loading text if loading, otherwise show children */}
      {isLoading ? (
        <div className="flex items-center justify-center">
          {/* Spinner icon */}
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </div>
      ) : children}
    </button>
  );
};

export default Button;
