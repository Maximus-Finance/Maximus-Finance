'use client';

import { useTheme } from '@/hooks/useTheme';
import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import { PageType } from '@/types';

interface HomePageProps {
  onNavigate: (page: PageType) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="pt-16">
      <HeroSection isDarkMode={isDarkMode} onNavigate={onNavigate} />
      <StatsSection isDarkMode={isDarkMode} />
      <FeaturesSection isDarkMode={isDarkMode} />
      
      <section className={`py-12 sm:py-16 lg:py-20 ${isDarkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 font-space-grotesk">
          While others give you <span className="text-gray-400">data</span>, we give you the {" "} <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">decision</span>.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onNavigate('yields')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 font-space-grotesk"
            >
              Start Optimizing Now
            </button>
            <button 
              onClick={() => onNavigate('protocols')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-space-grotesk"
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