'use client';

import { PageType } from '@/types';
import Image from 'next/image';

interface LogoProps {
  onNavigate: (page: PageType) => void;
}

const Logo: React.FC<LogoProps> = ({ onNavigate }) => {
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
        <span className="text-lg font-bold tracking-tight font-sans transition-colors duration-300 logo-text">
          Maximus Finance
        </span>
        <span className="text-xs tracking-wide font-medium logo-subtitle">
          DeFi Yield Optimization
        </span>
      </div>
    </button>
  );
};

export default Logo;