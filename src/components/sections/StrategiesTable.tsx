'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useLiveProtocolData } from '@/hooks/useLiveProtocolData';
import LiveDataIndicator from '@/components/ui/LiveDataIndicator';
import DataQualityIndicator from '@/components/ui/DataQualityIndicator';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface StrategiesCardsProps {}

const StrategiesCards: React.FC<StrategiesCardsProps> = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const { opportunities, isLoading, error, lastUpdated, dataQuality, systemHealth, alerts } = useLiveProtocolData();

  // Enhanced yield calculation using 8-loop strategy for liquid staking protocols only
  const calculateEnhancedAPY = (baseAPY: string, protocol: string, category: string): { enhanced: number; isEligible: boolean } => {
    const numericAPY = parseFloat(baseAPY.replace('%', ''));
    if (isNaN(numericAPY)) return { enhanced: numericAPY, isEligible: false };
    
    // Only enhance liquid staking protocols (Benqi, GoGoPool)
    const isLiquidStaking = category === 'Liquid Staking' && (protocol === 'Benqi' || protocol === 'GoGoPool');
    if (!isLiquidStaking) return { enhanced: numericAPY, isEligible: false };
    
    // 8-loop calculation with 70% collateral factor
    const f = 0.70; // collateral factor
    const loops = 8;
    
    // Cumulative supply after 8 loops: S8 = 100 × (1 - f^9) / (1 - f)
    const cumulativeSupply = 100 * (1 - Math.pow(f, loops + 1)) / (1 - f);
    
    // Cumulative borrow after 8 loops: B8 = 100 × f(1 - f^8) / (1 - f)
    const cumulativeBorrow = 100 * f * (1 - Math.pow(f, loops)) / (1 - f);
    
    // Assume 2.03% borrow rate (standard for liquid staking)
    const borrowRate = 2.03;
    
    // Net APY calculation: (numericAPY * cumulativeSupply/100) - (borrowRate * cumulativeBorrow/100)
    const netAPY = (numericAPY * cumulativeSupply / 100) - (borrowRate * cumulativeBorrow / 100);
    
    // User gets 70% of net APY added to original APY
    const userBoost = netAPY * 0.70;
    const enhancedAPY = userBoost;
    
    return { enhanced: enhancedAPY, isEligible: true };
  };

  // Format TVL to prevent overflow
  const formatTVL = (tvlString: string): string => {
    if (!tvlString || tvlString === 'N/A' || tvlString === '0' || tvlString === '$0') {
      return 'N/A';
    }
    
    const numericValue = tvlString.replace(/[$,]/g, '').trim();
    
    if (numericValue.length > 20) {
      return 'N/A';
    }
    
    const match = numericValue.match(/^([\d.]+)([MBKmbt]?)$/i);
    
    if (!match) {
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
    
    if (number > 999999) {
      return 'N/A';
    }
    
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
              className="px-6 py-3 rounded-xl h-12 w-32 animate-pulse shadow-lg bg-gray-700"
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div 
              key={i} 
              className="rounded-3xl p-8 animate-pulse border shadow-lg bg-gray-800 border-gray-600"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-700" />
                <div className="flex-1">
                  <div className="h-6 rounded-lg mb-2 bg-gray-700" />
                  <div className="h-4 w-20 rounded-lg bg-gray-700" />
                </div>
              </div>
              <div className="h-24 rounded-2xl mb-6 bg-gray-700" />
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="h-16 rounded-xl bg-gray-700" />
                <div className="h-16 rounded-xl bg-gray-700" />
              </div>
              <div className="h-12 rounded-2xl bg-gray-700" />
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
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white shadow-lg'
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
        <LiveDataIndicator 
          lastUpdated={lastUpdated} 
          isLoading={isLoading} 
          error={error} 
        />
        <DataQualityIndicator 
          quality={dataQuality}
          systemHealth={systemHealth}
          alerts={alerts}
        />
      </div>

      {/* Cards Grid */}
      {filteredData.length === 0 ? (
        <div className="rounded-3xl p-12 text-center animate-smooth-entrance shadow-lg border bg-gray-800 border-gray-600">
          <div className="text-xl font-hind text-gray-300">
            {isLoading ? 'Loading liquid staking strategies...' : 'No liquid staking strategies available for this asset'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
          {filteredData.map((item, index) => {
            const { enhanced: enhancedAPY, isEligible } = calculateEnhancedAPY(item.apy, item.protocol, item.category);
            
            return (
              <div
                key={item.id}
                className="group relative rounded-3xl p-8 transition-all duration-500 animate-smooth-entrance hover-light flex flex-col h-full bg-gray-800 border-gray-600 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] border shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center space-x-2">
                    {item.isLive ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold font-hind text-green-400">
                          Live
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-xs font-semibold font-hind text-gray-400">
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
                    <h3 className="font-bold text-2xl font-hind text-white">
                      {item.protocol}
                    </h3>
                    <div className="flex items-center mt-2">
                      <span className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold font-hind shadow-lg">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* APY Display */}
                {isEligible ? (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* Protocol APY */}
                    <div className="rounded-2xl p-4 border bg-blue-900/20 border-blue-700/30">
                      <div className="text-center">
                        <div className="font-bold text-2xl font-hind text-blue-400">
                          {item.apy}
                        </div>
                        <div className="text-xs font-hind font-medium mt-1 text-blue-300">
                          Protocol APY
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced APY */}
                    <div className="rounded-2xl p-4 border bg-green-900/20 border-green-700/30">
                      <div className="text-center">
                        <div className="font-bold text-2xl font-hind text-green-400">
                          {enhancedAPY.toFixed(1)}%
                        </div>
                        <div className="text-xs font-hind font-medium mt-1 text-green-300">
                          Enhanced APY
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl p-6 mb-6 border bg-green-900/20 border-green-700/30">
                    <div className="text-center">
                      <div className="font-bold text-4xl font-hind text-green-400">
                        {item.apy}
                      </div>
                      <div className="text-sm font-hind font-medium mt-1 text-green-300">
                        Annual Percentage Yield
                      </div>
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-gray-800/50">
                    <div className="text-sm font-hind mb-2 text-gray-400">
                      Asset
                    </div>
                    <div className="font-bold text-lg font-hind text-gray-200">
                      {item.pair}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-800/50">
                    <div className="text-sm font-hind mb-2 text-gray-400">
                      TVL
                    </div>
                    <div className="font-bold text-lg font-hind text-gray-200">
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



                {/* Action Button */}
                <div className="text-center mt-auto">
                  <Button 
                    onClick={() => window.open(item.url, '_blank')}
                    className="w-full"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Start Enhanced Strategy</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                  </Button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default StrategiesCards;