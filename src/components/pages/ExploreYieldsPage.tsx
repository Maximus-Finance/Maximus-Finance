'use client';

import { useTheme } from '@/hooks/useTheme';
import YieldsTable from '@/components/sections/YieldsTable';
import { useLiveProtocolData } from '@/hooks/useLiveProtocolData';

const ExploreYieldsPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { isLoading, lastUpdated, totalTVL, averageAPY, activeProtocols } = useLiveProtocolData();

  return (
    <div className="pt-16 font-hind">
      <section className={`min-h-screen py-20 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-black' 
          : 'bg-gradient-to-br from-white via-blue-50/30 to-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className={`text-5xl md:text-7xl font-bold mb-8 font-hind animate-smooth-entrance hover-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Explore <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">Live Yields</span>
            </h1>
            <p className={`text-xl font-hind animate-light-float ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Real-time yield opportunities across the Avalanche ecosystem
            </p>
            
            {/* Live Status Indicator */}
            <div className="flex items-center justify-center mt-6 space-x-6 animate-light-bounce">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className={`text-base font-hind font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isLoading ? 'Updating...' : 'Live Data'}
                </span>
              </div>
              {lastUpdated && (
                <span className={`text-base font-hind ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <YieldsTable isDarkMode={isDarkMode} />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { 
                value: `$${(totalTVL / 1000000).toFixed(1)}M`, 
                label: 'Total Value Locked', 
                gradient: 'from-green-400 to-emerald-500' 
              },
              { 
                value: `${averageAPY.toFixed(1)}%`, 
                label: 'Average APY', 
                gradient: 'from-blue-400 to-cyan-500' 
              },
              { 
                value: activeProtocols.toString(), 
                label: 'Active Protocols', 
                gradient: 'from-purple-400 to-pink-500' 
              },
            ].map((stat, index) => (
              <div 
                key={index}
                className={`p-10 rounded-3xl text-center hover-light animate-smooth-entrance shadow-2xl transform hover:scale-105 transition-all duration-300 ${
                  isDarkMode ? 'glass-3d-dark animate-light-float' : 'glass-3d animate-light-bounce'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`text-6xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-4 font-hind hover-light`}>
                  {isLoading ? '...' : stat.value}
                </div>
                <div className={`font-hind text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExploreYieldsPage;