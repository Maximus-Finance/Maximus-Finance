'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useLiveProtocolData } from '@/hooks/useLiveProtocolData';
import LiveDataIndicator from '@/components/ui/LiveDataIndicator';
import DataQualityIndicator from '@/components/ui/DataQualityIndicator';

interface YieldsTableProps {
  isDarkMode: boolean;
}

const YieldsTable: React.FC<YieldsTableProps> = ({ isDarkMode }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const { opportunities, isLoading, error, lastUpdated, dataQuality, systemHealth, alerts } = useLiveProtocolData();
  
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
              className={`px-6 py-3 rounded-xl h-12 w-32 animate-pulse ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </div>
        <div className={`rounded-3xl overflow-hidden shadow-2xl p-8 ${
          isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'
        }`}>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-20 rounded-xl animate-pulse ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
              }`} />
            ))}
          </div>
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
                ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white shadow-2xl animate-subtle-glow'
                : isDarkMode
                ? 'glass-3d-dark text-gray-300 hover:text-white animate-light-float'
                : 'glass-3d text-gray-700 hover:text-gray-900 animate-light-bounce'
              }
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="relative z-10">{filter}</span>
            
            {/* Animated background for non-selected buttons */}
            {selectedFilter !== filter && (
              <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                ${isDarkMode 
                  ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20' 
                  : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10'
                }
              `} />
            )}
            
            {/* Shimmer effect for selected button */}
            {selectedFilter === filter && (
              <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-[shimmer_2s_infinite] opacity-30" />
            )}
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
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Enhanced Table with Glassmorphism */}
      <div className={`
        rounded-3xl overflow-hidden shadow-2xl animate-smooth-entrance relative group hover-light
        ${isDarkMode ? 'glass-3d-dark' : 'glass-3d'}
        hover:shadow-[0_0_50px_rgba(147,51,234,0.3)] transition-all duration-500 animate-background-shift
      `}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`
              relative
              ${isDarkMode ? 'glass-3d-dark' : 'glass-3d'}
            `}>
              <tr>
                {['Protocol', 'Category', 'Pair/Asset', 'APY', 'TVL', 'Risk', 'Status', 'Action'].map((header, index) => (
                  <th 
                    key={header} 
                    className={`
                      px-6 py-6 text-left font-bold font-hind relative group
                      ${isDarkMode ? 'text-gray-100' : 'text-gray-800 hover:text-gray-900'}
                      animate-smooth-entrance hover-light
                    `}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <span className="relative z-10">{header}</span>
                    <div className={`
                      absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 
                      transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 w-full
                    `} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {isLoading ? 'Loading protocols...' : 'No protocols available for this filter'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={`transition-all duration-300 hover:z-10 relative animate-smooth-entrance hover-light ${
                      isDarkMode 
                        ? 'border-t border-gray-700/30 glass-3d-dark' 
                        : 'border-t border-gray-200/30 glass-3d'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-4 group">
                        <div className="text-4xl transform transition-all duration-300 group-hover:scale-110 animate-gentle-rotate">
                          {item.icon}
                        </div>
                        <div>
                          <span className={`font-bold text-xl font-hind ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.protocol}
                          </span>
                          <div className={`text-sm font-hind ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Protocol
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 text-white px-5 py-3 rounded-2xl text-sm font-bold font-hind shadow-2xl hover-light animate-light-bounce transform hover:scale-105">
                        {item.category}
                      </span>
                    </td>
                    <td className={`px-6 py-6 font-bold font-hind text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {item.pair}
                    </td>
                    <td className="px-6 py-6">
                      <div className="font-bold text-3xl bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent font-hind hover-light">
                        {item.apy}
                      </div>
                      <div className="text-xs text-gray-500 font-hind animate-fade-in">Annual Return</div>
                    </td>
                    <td className={`px-6 py-6 font-bold text-lg font-hind ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {item.tvl}
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-5 py-3 rounded-2xl text-sm font-bold font-hind shadow-lg hover-light animate-light-bounce transform hover:scale-105 ${
                        item.risk === 'Low' ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-white' :
                        item.risk === 'Medium' ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-white' :
                        'bg-gradient-to-r from-red-400 via-pink-500 to-red-600 text-white'
                      }`}>
                        {item.risk}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-2">
                        {item.isLive ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className={`text-sm font-semibold font-hind ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              Live
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            <span className={`text-sm font-semibold font-hind ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Offline
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <Button 
                        size="sm"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        Stake Now
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Features display for selected protocols */}
      {filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {filteredData.map((item, index) => item.features && (
            <div 
              key={item.id}
              className={`p-6 rounded-2xl transition-all duration-300 hover-light animate-smooth-entrance ${
                isDarkMode ? 'glass-3d-dark animate-light-float' : 'glass-3d animate-light-bounce'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h4 className={`font-bold text-lg mb-3 font-hind ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {item.protocol} Features
              </h4>
              <div className="flex flex-wrap gap-3">
                {item.features.map((feature, idx) => (
                  <span 
                    key={idx}
                    className={`text-sm px-4 py-2 rounded-xl font-hind font-medium hover-light transition-all duration-300 ${
                      isDarkMode ? 'glass-3d-dark text-gray-300 hover:text-white' : 'glass-3d text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YieldsTable;