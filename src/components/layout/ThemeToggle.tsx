'use client';

import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, onToggle }) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`
          relative p-4 rounded-2xl transition-all duration-300 hover-light animate-light-float group overflow-hidden
          ${isDarkMode 
            ? 'glass-3d-dark animate-background-shift shadow-2xl' 
            : 'glass-3d animate-background-shift shadow-2xl'
          }
        `}
        aria-label="Toggle theme"
      >
        <div className="relative z-10 flex items-center justify-center">
          <div className={`
            transition-all duration-500 transform
            ${isDarkMode ? 'rotate-180 scale-100' : 'rotate-0 scale-0'}
            absolute
          `}>
            <Sun 
              size={24} 
              className="text-yellow-400 drop-shadow-lg animate-gentle-rotate" 
            />
          </div>
          <div className={`
            transition-all duration-500 transform
            ${isDarkMode ? 'rotate-0 scale-0' : 'rotate-180 scale-100'}
            absolute
          `}>
            <Moon 
              size={24} 
              className="text-blue-600 drop-shadow-lg animate-light-bounce" 
            />
          </div>
        </div>
        
        {/* Light background gradient */}
        <div className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300
          ${isDarkMode 
            ? 'bg-gradient-to-br from-yellow-400/20 via-orange-500/15 to-yellow-600/20' 
            : 'bg-gradient-to-br from-blue-400/20 via-purple-500/15 to-blue-600/20'
          }
        `} />
      </button>
      
      {/* Light floating indicator */}
      <div className={`
        absolute -top-2 -right-2 w-4 h-4 rounded-full transition-all duration-300 hover-light
        ${isDarkMode ? 'bg-yellow-400 animate-pulse shadow-lg' : 'bg-blue-500 animate-gentle-rotate shadow-lg'}
      `} />
    </div>
  );
};

export default ThemeToggle;