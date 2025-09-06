'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLiveProtocolData } from '@/hooks/useLiveProtocolData';
import Button from '@/components/ui/Button';
import StakingModal from '@/components/staking/StakingModal';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ProtocolsGridProps {}

const ProtocolsGrid: React.FC<ProtocolsGridProps> = () => {
  // const [selectedFilter, setSelectedFilter] = useState('All');
  const { opportunities, isLoading } = useLiveProtocolData();
  const [stakingModal, setStakingModal] = useState<{
    isOpen: boolean;
    protocol: string;
    baseAPY: string;
    enhancedAPY: string;
  }>({
    isOpen: false,
    protocol: '',
    baseAPY: '',
    enhancedAPY: ''
  });

  // Enhanced yield calculation using 8-loop strategy for liquid staking protocols
  const calculateEnhancedAPY = (baseAPY: string): { enhanced: number; isEligible: boolean } => {
    const numericAPY = parseFloat(baseAPY.replace('%', ''));
    if (isNaN(numericAPY)) return { enhanced: numericAPY, isEligible: false };
    
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

  // Only show liquid staking protocols (BENQI and GoGoPool)
  const liquidStakingData = opportunities.filter(item => 
    item.category === 'Liquid Staking' && 
    (item.protocol === 'BENQI' || item.protocol === 'GoGoPool')
  );

  // const filters = ['All', 'USDC', 'USDT', 'AVAX'];

  const filteredData = liquidStakingData;

  const handleStartStrategy = (item: { protocol: string; apy: string; }, enhancedAPY: number) => {
    setStakingModal({
      isOpen: true,
      protocol: item.protocol,
      baseAPY: item.apy,
      enhancedAPY: `${enhancedAPY.toFixed(1)}%`
    });
  };

  const closeStakingModal = () => {
    setStakingModal({
      isOpen: false,
      protocol: '',
      baseAPY: '',
      enhancedAPY: ''
    });
  };

  if (isLoading && liquidStakingData.length === 0) {
    return (
      <div className="space-y-8 font-hind">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {[1, 2].map(i => (
            <div key={i} className={`h-80 rounded-3xl animate-pulse hover-light ${
              'glass-3d-dark animate-light-float'
            }`} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-hind">
      {/* Enhanced Filter Buttons - Removed */}
      {/* <div className="flex flex-wrap justify-center gap-3">
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
      </div> */}

      {filteredData.length === 0 ? (
        <div className={`
          rounded-3xl p-12 text-center animate-smooth-entrance shadow-lg border
          ${'bg-gray-800 border-gray-600'}
        `}>
          <div className={`text-xl font-hind ${'text-gray-300'}`}>
            {isLoading ? 'Loading liquid staking strategies...' : 'No liquid staking strategies available for this asset'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 items-stretch">
          {filteredData.map((item, index) => {
            const { enhanced: enhancedAPY } = calculateEnhancedAPY(item.apy);

            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-3xl transition-all duration-500 animate-card-entrance flex flex-col h-full p-8 glass-3d-dark animate-float3d hover-light shadow-2xl hover:shadow-[0_0_50px_rgba(147,51,234,0.3)] transform sm:hover:scale-105"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center space-x-2">
                    {item.isLive ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className={`text-xs font-semibold font-hind ${'text-green-400'}`}>
                          Live
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className={`text-xs font-semibold font-hind ${'text-gray-400'}`}>
                          Offline
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Protocol Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="text-5xl transform transition-all duration-300 hover:scale-110 animate-gentle-rotate">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-2xl font-hind ${'text-white'}`}>
                      {item.protocol}
                    </h3>
                  </div>
                </div>

                {/* Dual APY Display */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Protocol APY */}
                  <div className="rounded-2xl p-4 border bg-blue-900/20 border-blue-700/30">
                    <div className="text-center">
                      <div className={`font-bold text-2xl font-hind ${
                        'text-blue-400'
                      }`}>
                        {item.apy}
                      </div>
                      <div className={`text-xs font-hind font-medium mt-1 ${'text-blue-300'}`}>
                        Protocol APY
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced APY */}
                  <div className="rounded-2xl p-4 border bg-green-900/20 border-green-700/30">
                    <div className="text-center">
                      <div className={`font-bold text-2xl font-hind ${
                        'text-green-400'
                      }`}>
                        {enhancedAPY.toFixed(1)}%
                      </div>
                      <div className={`text-xs font-hind font-medium mt-1 ${'text-green-300'}`}>
                        Enhanced APY
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid - Fixed height */}
                <div className="grid grid-cols-2 gap-4 mb-6 min-h-[120px]">
                  <div className={`p-4 rounded-xl flex flex-col justify-start ${'bg-gray-800/50'}`}>
                    <div className={`text-sm font-hind mb-2 ${'text-gray-400'}`}>
                      Asset
                    </div>
                    <div className={`font-bold text-lg font-hind ${'text-gray-200'}`}>
                      {item.pair}
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl flex flex-col justify-start ${'bg-gray-800/50'}`}>
                    <div className={`text-sm font-hind mb-2 ${'text-gray-400'}`}>
                      TVL
                    </div>
                    <div className={`font-bold text-lg font-hind ${'text-gray-200'}`}>
                      {item.tvl}
                    </div>
                  </div>
                </div>

                {/* Risk Badge - Absolutely positioned for perfect alignment */}
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
                    onClick={() => handleStartStrategy(item, enhancedAPY)}
                    className="w-full"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Start Enhanced Strategy</span>
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </Button>
                </div>

                {/* Enhanced 3D Gradient Overlay */}
                <div className="absolute inset-0 bg-purple-600/20 opacity-0 hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      )}

      {/* Staking Modal */}
      <StakingModal
        isOpen={stakingModal.isOpen}
        onClose={closeStakingModal}
        protocol={stakingModal.protocol}
        baseAPY={stakingModal.baseAPY}
        enhancedAPY={stakingModal.enhancedAPY}
      />
    </div>
  );
};

export default ProtocolsGrid;