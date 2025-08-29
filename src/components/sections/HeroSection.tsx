'use client';

import Button from '@/components/ui/Button';
import { PageType } from '@/types';

interface HeroSectionProps {
  isDarkMode: boolean;
  onNavigate: (page: PageType) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isDarkMode, onNavigate }) => {
  return (
    <section className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-black' 
        : 'bg-gradient-to-br from-white via-blue-50/50 to-gray-50'
    }`}>
      {/* Light animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mix-blend-screen filter blur-3xl animate-light-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full mix-blend-screen filter blur-3xl animate-gentle-rotate"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mix-blend-screen filter blur-3xl animate-light-bounce"></div>
      </div>

      {/* Lightning effect from center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-1 h-full ${isDarkMode ? 'bg-gradient-to-b from-transparent via-purple-400/30 to-transparent' : 'bg-gradient-to-b from-transparent via-blue-400/30 to-transparent'} animate-pulse`}></div>
        <div className={`h-1 w-full absolute ${isDarkMode ? 'bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent' : 'bg-gradient-to-r from-transparent via-purple-400/30 to-transparent'} animate-pulse animate-delay-1000`}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="animate-smooth-entrance">
        <h1 className={`text-6xl md:text-8xl font-bold mb-8 font-hind hover-light ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Maximize Your{' '}
        <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
          Avalanche Yields
        </span>
        {' '} Instantly, Intelligently, Effortlessly
      </h1>
      <p className={`text-xl md:text-2xl mb-12 max-w-4xl mx-auto font-hind animate-light-float ${
        isDarkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        We scan the entire Avalanche DeFi ecosystem in real time, compare every yield 
        opportunity, and guide you to the highest returns.
      </p>
      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <div className="hover-light animate-light-bounce">
          <Button 
            onClick={() => onNavigate('yields')}
            size="lg"
            className="transform hover:scale-105 transition-all duration-300"
          >
            Find Best Yield Now
          </Button>
        </div>
        <div className="hover-light animate-light-float">
          <Button 
            onClick={() => onNavigate('yields')}
            variant="outline"
            size="lg"
            className="transform hover:scale-105 transition-all duration-300"
          >
            View Live Yields
          </Button>
        </div>
      </div>
    </div>
  </div>
</section>
);
};
export default HeroSection;