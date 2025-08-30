'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLiveProtocolData } from '@/hooks/useLiveProtocolData';
import LiveDataIndicator from '@/components/ui/LiveDataIndicator';
import Button from '@/components/ui/Button';

interface ProtocolsGridProps {
  isDarkMode: boolean;
}

const ProtocolsGrid: React.FC<ProtocolsGridProps> = ({ isDarkMode }) => {
  const [expandedProtocol, setExpandedProtocol] = useState<string | null>(null);
  const { opportunities, isLoading, error, lastUpdated } = useLiveProtocolData();

  if (isLoading && opportunities.length === 0) {
    return (
      <div className="space-y-8 font-hind">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-80 rounded-3xl animate-pulse hover-light ${
              isDarkMode ? 'glass-3d-dark animate-light-float' : 'glass-3d animate-light-bounce'
            }`} style={{ animationDelay: `${i * 0.01}s` }} />
          ))}
        </div>
      </div>
    );
  }

  const protocolGroups = opportunities.reduce((acc, opportunity) => {
    const key = opportunity.protocol;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(opportunity);
    return acc;
  }, {} as Record<string, typeof opportunities>);

  return (
    <div className="space-y-8 font-hind">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        {Object.entries(protocolGroups).map(([protocol, protocolOpportunities]) => {
          const totalProtocolTVL = protocolOpportunities.reduce((sum, opp) => {
            const tvlValue = parseFloat(opp.tvl.replace(/[$M,]/g, ''));
            return sum + tvlValue;
          }, 0);
          
          const avgAPY = protocolOpportunities.reduce((sum, opp) => {
            return sum + parseFloat(opp.apy.replace('%', ''));
          }, 0) / protocolOpportunities.length;

          return (
            <div
              key={protocol}
              className={`relative overflow-hidden rounded-3xl transition-all duration-500 cursor-pointer animate-card-entrance ${
                isDarkMode 
                  ? 'glass-3d-dark animate-float3d hover-light shadow-2xl hover:shadow-[0_0_50px_rgba(147,51,234,0.3)]' 
                  : 'glass-3d-light animate-light-bounce hover-light-theme shadow-xl hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]'
              } transform sm:hover:scale-105`}
              style={{ animationDelay: `${Object.keys(protocolGroups).indexOf(protocol) * 0.2}s` }}
              onMouseEnter={() => setExpandedProtocol(protocol)}
              onMouseLeave={() => setExpandedProtocol(null)}
            >
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-3xl sm:text-4xl animate-rotate3d hover-3d">{protocolOpportunities[0].icon}</span>
                    <div>
                      <h3 className={`text-xl sm:text-2xl font-bold font-hind hover-3d ${isDarkMode ? 'text-white animate-text-glow' : 'text-slate-800'}`}>
                        {protocol}
                      </h3>
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs font-bold font-hind animate-bubble hover-3d">
                        {protocolOpportunities[0].category}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className={`${isDarkMode ? 'text-gray-400 animate-text-glow' : 'text-slate-500'} animate-float3d hover-3d`} size={20} />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div>
                    <div className={`text-sm font-hind font-semibold ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>TVL</div>
                    <div className={`text-lg sm:text-xl font-bold font-hind ${isDarkMode ? 'text-white animate-text-glow' : 'text-slate-800'}`}>
                      {totalProtocolTVL > 999 ? 'NA' : `$${totalProtocolTVL.toFixed(1)}M`}
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm font-hind font-semibold ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Avg APY</div>
                    <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-hind animate-text-glow">
                      {avgAPY.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className={`text-base font-hind ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {protocolOpportunities.length} yield opportunit{protocolOpportunities.length === 1 ? 'y' : 'ies'} available
                  </div>
                </div>

                {/* Expanded Content */}
                <div className={`transition-all duration-500 overflow-hidden ${
                  expandedProtocol === protocol ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className={`font-bold mb-4 font-hind text-lg hover-3d ${isDarkMode ? 'text-white animate-text-glow' : 'text-gray-900'}`}>
                      Available Opportunities:
                    </h4>
                    <div className="space-y-2">
                      {protocolOpportunities.map((opp) => (
                        <div key={opp.id} className={`p-4 rounded-xl transition-all duration-300 hover-3d ${
                          isDarkMode ? 'glass-3d-dark animate-bubble' : 'glass-3d animate-float3d'
                        }`}>
                          <div className="flex justify-between items-center">
                            <span className={`font-semibold font-hind ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              {opp.pair}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-bold font-hind">{opp.apy}</span>
                              <div className={`w-2 h-2 rounded-full ${opp.isLive ? 'bg-green-500' : 'bg-gray-400'}`} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => window.open(protocolOpportunities[0].url, '_blank')}
                      >
                        Explore {protocol}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Static Button for Non-expanded State */}
                {expandedProtocol !== protocol && (
                  <Button 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => window.open(protocolOpportunities[0].url, '_blank')}
                  >
                    View Details
                  </Button>
                )}
              </div>

              {/* Enhanced 3D Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/15 to-cyan-600/10 opacity-0 hover:opacity-100 transition-all duration-500 pointer-events-none animate-morphism-shift"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProtocolsGrid;