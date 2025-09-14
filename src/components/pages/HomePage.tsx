'use client';

import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import { PageType } from '@/types';

interface HomePageProps {
  onNavigate: (page: PageType) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="pt-16">
      <HeroSection onNavigate={onNavigate} />
      <StatsSection />
      <FeaturesSection />
      
      <section className="py-12 sm:py-16 lg:py-20 relative">
        <div className="absolute inset-0 glass-card"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 font-space-grotesk hero-cta-title">
          While others give you <span className="hero-cta-data">data</span>, we give you the {" "} <span className="hero-cta-decision">decision</span>.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onNavigate('yields')}
              className="glass-button-primary text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 font-space-grotesk"
            >
              Start Optimizing Now
            </button>
            <button 
              onClick={() => onNavigate('protocols')}
              className="glass-button border-2 border-white/20 hover:border-white/30 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 font-space-grotesk"
            >
              Explore Protocols
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;