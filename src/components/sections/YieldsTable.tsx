'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useLiveProtocolData } from '@/hooks/useLiveProtocolData';
import LiveDataIndicator from '@/components/ui/LiveDataIndicator';
import DataQualityIndicator from '@/components/ui/DataQualityIndicator';

interface YieldsCardsProps {
  isDarkMode: boolean;
}

const YieldsCards: React.FC<YieldsCardsProps> = ({ isDarkMode }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const { opportunities, isLoading, error, lastUpdated, dataQuality, systemHealth, alerts } = useLiveProtocolData();

  // Format TVL to prevent overflow
  const formatTVL = (tvlString: string): string => {
    // Handle edge cases
    if (!tvlString || tvlString === 'N/A' || tvlString === '0' || tvlString === '$0') {
      return 'N/A';
    }
    
    // Remove currency symbols and extract number
    const numericValue = tvlString.replace(/[$,]/g, '').trim();
    
    // Handle very long numbers that might be malformed
    if (numericValue.length > 20) {
      return 'N/A';
    }
    
    const match = numericValue.match(/^([\d.]+)([MBKmbt]?)$/i);
    
    if (!match) {
      // Fallback: try to extract just numbers
      const numberOnly = parseFloat(numericValue.replace(/[^\d.]/g, ''));
      if (isNaN(numberOnly)) return 'N/A';
      
      if (numberOnly > 1000000000) {
        return `$${(numberOnly / 1000000000).toFixed(1)}B`;
      } else if (numberOnly > 1000000) {
        return `$${(numberOnly / 1000000).toFixed(1)}M`;
      } else if (numberOnly > 1000) {
        return `$${(numberOnly / 1000).toFixed(1)}K`;
      } else {
        return `$${numberOnly.toFixed(0)}`;
      }
    }
    
    const [, value, unit] = match;
    const number = parseFloat(value);
    
    if (isNaN(number)) return 'N/A';
    
    // Handle very large numbers - likely data errors
    if (number > 999999) {
      return 'N/A';
    }
    
    // Handle units and format appropriately
    const upperUnit = unit.toUpperCase();
    
    if (upperUnit === 'M' || upperUnit === '') {
      if (number > 1000) {
        return `$${(number / 1000).toFixed(1)}B`;
      } else if (number > 100) {
        return `$${Math.round(number)}M`;
      } else if (number > 10) {
        return `$${number.toFixed(0)}M`;
      } else {
        return `$${number.toFixed(1)}M`;
      }
    } else if (upperUnit === 'B') {
      return `$${number.toFixed(1)}B`;
    } else if (upperUnit === 'K') {
      return `$${number.toFixed(0)}K`;
    }
    
    // Default case for no unit
    if (number > 1000000000) {
      return `$${(number / 1000000000).toFixed(1)}B`;
    } else if (number > 1000000) {
      return `$${(number / 1000000).toFixed(1)}M`;
    } else if (number > 1000) {
      return `$${(number / 1000).toFixed(1)}K`;
    } else {
      return `$${number.toFixed(0)}`;
    }
  };
  
  const filters = ['All', 'Liquid Staking', 'Lending', 'Borrowing', 'Token Staking', 'Validator Staking', 'Yield Farming'];

  const filteredData = selectedFilter === 'All' 
    ? opportunities 
    : opportunities.filter(item => item.category === selectedFilter);

  // Loading skeleton
  if (isLoading && opportunities.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap justify-center gap-4">
          {filters.map((filter, index) => (
            <div
              key={filter}
              className={`px-6 py-3 rounded-xl h-12 w-32 animate-pulse shadow-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div 
              key={i} 
              className={`rounded-3xl p-8 animate-pulse border shadow-lg ${
                isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                <div className="flex-1">
                  <div className={`h-6 rounded-lg mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                  <div className={`h-4 w-20 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                </div>
              </div>
              <div className={`h-24 rounded-2xl mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`h-16 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <div className={`h-16 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              </div>
              <div className={`h-12 rounded-2xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-hind">
      {/* Enhanced Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {filters.map((filter, index) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`
              relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 font-hind animate-smooth-entrance overflow-hidden group hover-light
              ${selectedFilter === filter
                ? 'bg-blue-600 text-white shadow-lg'
                : isDarkMode
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white shadow-lg'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-gray-900 shadow-lg'
              }
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="relative z-10">{filter}</span>
            
          </button>
        ))}
      </div>

      {/* Live Data Indicator */}
      <div className="flex justify-center space-x-6">
        <DataQualityIndicator 
          quality={dataQuality}
          systemHealth={systemHealth}
          alerts={alerts}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Cards Grid */}
      {filteredData.length === 0 ? (
        <div className={`
          rounded-3xl p-12 text-center animate-smooth-entrance shadow-lg border
          ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}
        `}>
          <div className={`text-xl font-hind ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {isLoading ? 'Loading protocols...' : 'No protocols available for this filter'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredData.map((item, index) => (
            <div
              key={item.id}
              className={`
                group relative rounded-3xl p-8 transition-all duration-500 animate-smooth-entrance hover-light
                ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}
                hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]
                border shadow-lg
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Status indicator */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center space-x-2">
                  {item.isLive ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className={`text-xs font-semibold font-hind ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Live
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span className={`text-xs font-semibold font-hind ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Offline
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Protocol Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-5xl transform transition-all duration-300 group-hover:scale-110 animate-gentle-rotate">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-2xl font-hind ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.protocol}
                  </h3>
                  <div className="flex items-center mt-2">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold font-hind shadow-lg">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* APY Highlight */}
              <div className={`rounded-2xl p-6 mb-6 border ${
                isDarkMode 
                  ? 'bg-green-900/20 border-green-700/30' 
                  : 'bg-green-50 border-green-200/30'
              }`}>
                <div className="text-center">
                  <div className={`font-bold text-4xl font-hind ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {item.apy}
                  </div>
                  <div className={`text-sm font-hind font-medium mt-1 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                    Annual Percentage Yield
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <div className={`text-sm font-hind mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Pair/Asset
                  </div>
                  <div className={`font-bold text-lg font-hind break-all leading-tight overflow-wrap-anywhere ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {item.pair}
                  </div>
                </div>
                <div className={`p-4 rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <div className={`text-sm font-hind mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    TVL
                  </div>
                  <div className={`font-bold text-lg font-hind break-all leading-tight overflow-wrap-anywhere min-w-0 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`} title={item.tvl}>
                    {formatTVL(item.tvl)}
                  </div>
                </div>
              </div>

              {/* Risk Badge */}
              <div className="flex justify-center mb-6">
                <span className={`px-6 py-3 rounded-2xl text-sm font-bold font-hind shadow-lg transform transition-all duration-300 hover:scale-105 ${
                  item.risk === 'Low' ? 'bg-green-600 text-white' :
                  item.risk === 'Medium' ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {item.risk} Risk
                </span>
              </div>

              {/* Features */}
              {item.features && item.features.length > 0 && (
                <div className="mb-6">
                  <h4 className={`text-sm font-bold font-hind mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Features
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {item.features.slice(0, 3).map((feature, idx) => (
                      <span 
                        key={idx}
                        className={`text-xs px-3 py-1 rounded-lg font-hind transition-all duration-300 ${
                          isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                    {item.features.length > 3 && (
                      <span className={`text-xs px-3 py-1 rounded-lg font-hind ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        +{item.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="text-center">
                <Button 
                  onClick={() => window.open(item.url, '_blank')}
                  className="w-full"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Stake Now</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                </Button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default YieldsCards;