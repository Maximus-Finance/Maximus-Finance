'use client';

import Button from '@/components/ui/Button';
import { PageType } from '@/types';

interface HeroSectionProps {
  onNavigate: (page: PageType) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="animate-smooth-entrance">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 font-instrument-sans leading-tight hero-main-title">
            Maximize Your{' '}
            <span className="hero-accent">
              Avalanche Yields
            </span>
            <br className="block sm:hidden" />
            <span className="hidden sm:inline"> </span>
            Instantly, Intelligently, Effortlessly
          </h1>
          <p className="text-lg sm:text-xl md:text-xl mb-8 sm:mb-12 max-w-3xl mx-auto font-instrument-sans px-4 sm:px-0 hero-subtitle">
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