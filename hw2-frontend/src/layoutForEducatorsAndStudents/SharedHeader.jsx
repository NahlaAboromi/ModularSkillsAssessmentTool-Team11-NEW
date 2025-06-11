import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import ThemeToggle from '../DarkLightMood/ThemeToggle';
import FeaturesModal from './FeaturesModal';
import AboutModal from './AboutSEL';

const SharedHeader = () => {
    // Get current theme from context
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark'; 

  return (
    <header
      className={`w-full flex justify-between items-center px-6 py-3 shadow-sm
        ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 border-b border-gray-200'}
      `}
    >
      {/* Left side of header with logo and title */}
      <div className="flex items-center gap-3">
        {/* Link to home page with SVG logo and site name */}
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            {/* SVG path for logo icon */}
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
          Edu Map
        </Link>
        {/* Badge indicating AI powered */}
        <span className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-red-400 to-green-300 text-white">
          AI POWERED
        </span>
      </div>

      {/* Right side of header with theme toggle and modals */}
      <div className="flex items-center gap-6 text-sm font-semibold">
        <ThemeToggle /> {/* Button or toggle for switching theme */}
        <FeaturesModal /> {/* Modal for features info */}
        <AboutModal /> {/* Modal for About SEL info */}
      </div>
    </header>
  );
};

export default SharedHeader;
