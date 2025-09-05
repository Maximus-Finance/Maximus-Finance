'use client';

import { PageType } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import Image from 'next/image';

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
      {/* Logo Image */}
      <div className="relative w-10 h-10 transition-all duration-300 group-hover:scale-110">
        <Image 
          src="/MaxFi.png" 
          alt="Maximus Finance Logo" 
          width={40}
          height={40}
          className="object-contain rounded-lg"
          priority
        />
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