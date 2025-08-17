'use client';

import { PageType } from '@/types';

interface LogoProps {
  onNavigate: (page: PageType) => void;
}

const Logo: React.FC<LogoProps> = ({ onNavigate }) => {
  return (
    <button 
      onClick={() => onNavigate('home')}
      className="flex items-center space-x-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-1"
    >
      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-lg font-jetbrains">M</span>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent font-space-grotesk">
        Maximus Finance
      </span>
    </button>
  );
};

export default Logo;