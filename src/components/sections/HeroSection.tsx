'use client';

import Button from '@/components/ui/Button';
import { PageType } from '@/types';

interface HeroSectionProps {
  onNavigate: (page: PageType) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-light-float"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl animate-gentle-rotate"></div>
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl animate-light-bounce"></div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-1 h-full bg-purple-400/30 animate-pulse"></div>
        <div className="h-1 w-full absolute bg-cyan-400/30 animate-pulse animate-delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="animate-smooth-entrance">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 font-instrument-sans leading-tight text-white">
        Maximize Your{' '}
        <span className="text-blue-400">
          Avalanche Yields
        </span>
        <br className="block sm:hidden" />
        <span className="hidden sm:inline"> </span>
        Instantly, Intelligently, Effortlessly
      </h1>
      <p className="text-lg sm:text-xl md:text-xl mb-8 sm:mb-12 max-w-3xl mx-auto font-instrument-sans px-4 sm:px-0 text-gray-400">
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