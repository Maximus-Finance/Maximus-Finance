'use client';

import { useTheme } from '@/hooks/useTheme';
import StrategiesCards from '@/components/sections/StrategiesTable';
import { useLiveProtocolData } from '@/hooks/useLiveProtocolData';

const StrategiesPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { isLoading, lastUpdated, totalTVL, averageAPY, activeProtocols, dataQuality, systemHealth } = useLiveProtocolData();

  return (
    <div className="pt-16 font-hind">
      <section className="min-h-screen py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 font-hind animate-smooth-entrance hover-light leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Yield <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">Strategies</span>
            </h1>
            <p className={`text-lg sm:text-xl font-hind animate-light-float px-4 sm:px-0 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Enhanced yield opportunities with our advanced looping strategies
            </p>
            
            {/* Live Status Indicator */}
            <div className="flex flex-col sm:flex-row items-center justify-center mt-4 sm:mt-6 space-y-3 sm:space-y-0 sm:space-x-6 animate-light-bounce">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  systemHealth >= 80 ? 'bg-green-400' :
                  systemHealth >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className={`text-sm sm:text-base font-hind font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isLoading ? 'Updating...' : `${dataQuality} Data Quality`}
                </span>
              </div>
              {lastUpdated && (
                <span className={`text-sm sm:text-base font-hind ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <div className={`text-xs px-2 py-1 rounded-lg ${
                systemHealth >= 80 ? 'bg-green-500/20 text-green-400' :
                systemHealth >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {systemHealth.toFixed(0)}% Health
              </div>
            </div>
          </div>

          <StrategiesCards isDarkMode={isDarkMode} />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
            {[
              { 
                value: `$${(totalTVL / 1000000).toFixed(1)}M`, 
                label: 'Total Value Locked', 
                gradient: 'from-green-400 to-emerald-500' 
              },
              { 
                value: `${(averageAPY * 1.7).toFixed(1)}%`, 
                label: 'Enhanced Average APY', 
                gradient: 'from-blue-400 to-cyan-500' 
              },
              { 
                value: activeProtocols.toString(), 
                label: 'Strategy Protocols', 
                gradient: 'from-purple-400 to-pink-500' 
              },
            ].map((stat, index) => (
              <div 
                key={index}
                className={`p-6 sm:p-8 lg:p-10 rounded-3xl text-center hover-light animate-smooth-entrance shadow-2xl transform sm:hover:scale-105 transition-all duration-300 ${
                  isDarkMode ? 'glass-3d-dark animate-light-float' : 'glass-3d-light animate-light-bounce'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-3 sm:mb-4 font-hind hover-light`}>
                  {isLoading ? '...' : stat.value}
                </div>
                <div className={`font-hind text-base sm:text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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

export default StrategiesPage;