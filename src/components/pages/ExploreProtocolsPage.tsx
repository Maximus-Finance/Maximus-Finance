'use client';

import { useTheme } from '@/hooks/useTheme';
import ProtocolsGrid from '@/components/sections/ProtocolsGrid';
import { useLiveProtocolData } from '@/hooks/useLiveProtocolData';
import { PageType } from '@/types';

interface ExploreProtocolsPageProps {
  onNavigate: (page: PageType) => void;
}

const ExploreProtocolsPage: React.FC<ExploreProtocolsPageProps> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme();
  const { isLoading, opportunities } = useLiveProtocolData();

  const calculateEnhancedAPY = (baseAPY: string): number => {
    const numericAPY = parseFloat(baseAPY.replace('%', ''));
    if (isNaN(numericAPY)) return 0;
    
    const f = 0.70; 
    const loops = 8;
    
    const cumulativeSupply = 100 * (1 - Math.pow(f, loops + 1)) / (1 - f);
    
    const cumulativeBorrow = 100 * f * (1 - Math.pow(f, loops)) / (1 - f);
    
    const borrowRate = 2.03;
    
    const netAPY = (numericAPY * cumulativeSupply / 100) - (borrowRate * cumulativeBorrow / 100);
    
    const userBoost = netAPY * 0.70;
    const enhancedAPY = userBoost;
    
    return enhancedAPY;
  };

  const liquidStakingData = opportunities.filter(item => 
    item.category === 'Liquid Staking' && 
    (item.protocol === 'BENQI' || item.protocol === 'GoGoPool')
  );

  const strategyTotalTVL = liquidStakingData.reduce((sum, opp) => {
    const tvlValue = parseFloat(opp.tvl.replace(/[$M,]/g, '')) * 1000000;
    return sum + (isNaN(tvlValue) ? 0 : tvlValue);
  }, 0);

  const totalEnhancedAPY = liquidStakingData.reduce((sum, opp) => {
    return sum + calculateEnhancedAPY(opp.apy);
  }, 0);

  const enhancedAverageAPY = liquidStakingData.length > 0 ? totalEnhancedAPY / liquidStakingData.length : 0;
  const activeStrategyProtocols = new Set(liquidStakingData.map(opp => opp.protocol)).size;

  return (
    <div className="pt-16 font-hind">
      <section className="min-h-screen py-12 sm:py-16 lg:py-20 perspective-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 font-hind animate-card-entrance hover-3d leading-tight ${isDarkMode ? 'text-white animate-text-glow' : 'text-gray-900'}`}>
              Yield <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient animate-text-glow">Strategies</span>
            </h1>
            <p className={`text-lg sm:text-xl font-hind animate-float3d px-4 sm:px-0 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Enhanced yield opportunities with our advanced looping strategies
            </p>
            
          </div>

          <ProtocolsGrid isDarkMode={isDarkMode} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
            {[
              { 
                value: `$${(strategyTotalTVL / 1000000).toFixed(1)}M`, 
                label: 'Total Value Locked', 
                gradient: 'from-green-400 to-emerald-500' 
              },
              { 
                value: `${enhancedAverageAPY.toFixed(1)}%`, 
                label: 'Enhanced Average APY', 
                gradient: 'from-blue-400 to-cyan-500' 
              },
              { 
                value: activeStrategyProtocols.toString(), 
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

          <div className="mt-12 sm:mt-16 lg:mt-20">
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 font-hind hover-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              How Our Strategies Work
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className={`p-6 sm:p-8 lg:p-10 rounded-3xl hover-light animate-smooth-entrance shadow-2xl transition-all duration-300 ${
                isDarkMode ? 'glass-3d-dark animate-light-float' : 'glass-3d-light animate-light-bounce'
              }`} style={{ animationDelay: '0.1s' }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 hover-light animate-gentle-rotate shadow-2xl">
                    <span className="text-white text-lg sm:text-2xl animate-light-float">🔄</span>
                  </div>
                  <div>
                    <span className="bg-green-100 text-green-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold font-hind hover-light animate-light-bounce">ACTIVE</span>
                    <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold mt-2 sm:mt-3 font-hind hover-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Advanced Yield Strategy
                    </h3>
                  </div>
                </div>
                <p className={`font-hind text-base sm:text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Using advanced mechansim of restaking and distributed yield to maximize your yields. 
                </p>
              </div>

              <div className={`p-6 sm:p-8 lg:p-10 rounded-3xl hover-3d animate-card-entrance shadow-2xl transition-all duration-500 ${
                isDarkMode ? 'glass-3d-dark animate-bubble' : 'glass-3d-light animate-float3d'
              }`} style={{ animationDelay: '0.4s' }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 hover-3d animate-rotate3d shadow-2xl">
                    <span className="text-white text-lg sm:text-2xl animate-bubble">🎯</span>
                  </div>
                  <div>
                    <span className="bg-purple-100 text-purple-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold font-hind hover-3d animate-float3d">OPTIMIZED</span>
                    <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold mt-2 sm:mt-3 font-hind hover-3d ${isDarkMode ? 'text-white animate-text-glow' : 'text-gray-900'}`}>
                      Risk-Managed Returns
                    </h3>
                  </div>
                </div>
                <p className={`font-hind text-base sm:text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Our strategies maintain safe collateral ratios while maximizing yields. 
                  Automated monitoring prevents liquidation risks.
                </p>
              </div>
            </div>

            <div className="mt-8 sm:mt-12">
              <div className={`p-6 sm:p-8 rounded-2xl text-white shadow-2xl animate-fade-in-up ${
                isDarkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 font-space-grotesk text-center">
                  Maximize your DeFi yields with smart strategies.
                </h3>
                <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100 font-space-grotesk text-center">
                  Enhanced APYs through our protocol.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => onNavigate('yields')}
                    className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 font-space-grotesk"
                  >
                    Start Strategy
                  </button>
                  <button 
                    onClick={() => onNavigate('yields')}
                    className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-space-grotesk"
                  >
                    View All Strategies
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExploreProtocolsPage;