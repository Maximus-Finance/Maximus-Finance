'use client';

import { PageType } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface LogoProps {
  onNavigate: (page: PageType) => void;
}

const Logo: React.FC<LogoProps> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <button 
      onClick={() => onNavigate('home')}
      className="flex items-center space-x-3 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl p-2 group"
    >
      {/* Modern MaxFi Icon */}
      <div className={`relative w-10 h-10 rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl ${
        isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
      }`}>
        {/* Background geometric pattern */}
        <div className="absolute inset-1 opacity-20">
          <svg viewBox="0 0 32 32" className="w-full h-full">
            <path d="M8 8L24 8L20 16L24 24L8 24L12 16Z" fill="white" />
          </svg>
        </div>
        
        {/* Main MaxFi text */}
        <div className="relative flex items-center justify-center h-full">
          <span className="text-white font-black text-sm tracking-tight font-sans">
            MaxFi
          </span>
        </div>
        
        {/* Corner accent */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
          isDarkMode ? 'bg-cyan-400' : 'bg-cyan-500'
        } opacity-80`} />
      </div>
      
      {/* Company Name */}
      <div className="flex flex-col items-start">
        <span className={`text-lg font-bold tracking-tight font-sans transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Maximus Finance
        </span>
        <span className={`text-xs tracking-wide font-medium ${
          isDarkMode ? 'text-blue-400' : 'text-blue-600'
        }`}>
          DeFi Yield Optimization
        </span>
      </div>
    </button>
  );
};

export default Logo;