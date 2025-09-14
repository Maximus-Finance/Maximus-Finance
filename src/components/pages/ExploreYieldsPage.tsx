'use client';

import YieldsCards from '@/components/sections/YieldsTable';
import { useLiveProtocolData } from '@/hooks/useLiveProtocolData';

const formatTVL = (value: number): string => {
  if (value >= 1000000000000) {
    const formatted = (value / 1000000000000);
    return formatted >= 100 ? `$${formatted.toFixed(0)}T` : `$${formatted.toFixed(1)}T`;
  } else if (value >= 1000000000) {
    const formatted = (value / 1000000000);
    return formatted >= 100 ? `$${formatted.toFixed(0)}B` : `$${formatted.toFixed(1)}B`;
  } else if (value >= 1000000) {
    const formatted = (value / 1000000);
    return formatted >= 100 ? `$${formatted.toFixed(0)}M` : `$${formatted.toFixed(1)}M`;
  } else if (value >= 1000) {
    const formatted = (value / 1000);
    return formatted >= 100 ? `$${formatted.toFixed(0)}K` : `$${formatted.toFixed(1)}K`;
  } else {
    return `$${Math.round(value)}`;
  }
};

const ExploreYieldsPage: React.FC = () => {
  const { isLoading, lastUpdated, totalTVL, averageAPY, activeProtocols, systemHealth } = useLiveProtocolData();

  return (
    <div className="pt-16 font-hind">
      <section className="min-h-screen py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 font-hind animate-smooth-entrance hover-light leading-tight page-title">
              Explore <span className="page-accent">Live Yields</span>
            </h1>
            <p className="text-lg sm:text-xl font-hind animate-light-float px-4 sm:px-0 page-subtitle">
              Real-time yield opportunities across the Avalanche ecosystem
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center mt-4 sm:mt-6 space-y-3 sm:space-y-0 sm:space-x-6 animate-light-bounce">
              {lastUpdated && (
                <span className="text-sm sm:text-base font-hind text-gray-400">
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

          <YieldsCards />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
            {[
              {
                value: formatTVL(totalTVL),
                label: 'Total Value Locked',
                color: 'text-green-400'
              },
              {
                value: `${averageAPY.toFixed(1)}%`,
                label: 'Average APY',
                color: 'text-blue-400'
              },
              {
                value: activeProtocols.toString(),
                label: 'Active Protocols',
                color: 'text-purple-400'
              },
            ].map((stat, index) => (
              <div 
                key={index}
                className="p-6 sm:p-8 lg:p-10 rounded-3xl text-center hover-light animate-smooth-entrance shadow-2xl transform sm:hover:scale-105 transition-all duration-300 glass-3d-dark animate-light-float"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${stat.color} mb-3 sm:mb-4 font-hind hover-light break-words`}>
                  {isLoading ? '...' : stat.value}
                </div>
                <div className="font-hind text-base sm:text-lg font-semibold text-gray-300">
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