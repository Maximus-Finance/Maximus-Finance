'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { ProtocolAggregator, AggregatedData, YieldOpportunity } from '@/components/protocols/ProtocolAggregator';

interface YieldsTableProps {
  isDarkMode: boolean;
  protocolData: AggregatedData | null;
  loading: boolean;
}

const YieldsTable: React.FC<YieldsTableProps> = ({ isDarkMode, protocolData, loading }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [yieldOpportunities, setYieldOpportunities] = useState<YieldOpportunity[]>([]);
  
  const filters = ['All', 'Liquid Staking', 'Borrowing', 'Yield Farming'];

  useEffect(() => {
    if (protocolData) {
      const aggregator = new ProtocolAggregator();
      const opportunities = aggregator.formatToYieldOpportunities(protocolData);
      setYieldOpportunities(opportunities);
    }
  }, [protocolData]);

  const filteredData = selectedFilter === 'All' 
    ? yieldOpportunities 
    : yieldOpportunities.filter(item => item.category === selectedFilter);

  // Loading skeleton
  if (loading && yieldOpportunities.length === 0) {
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
    <div className="space-y-8">
      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        {filters.map((filter, index) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 font-space-grotesk animate-slide-in ${
              selectedFilter === filter
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : isDarkMode
                ? 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 border border-gray-700'
                : 'bg-gray-200/80 text-gray-700 hover:bg-gray-300/80 border border-gray-300'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Live Data Indicator */}
      {!loading && (
        <div className="flex justify-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${
            isDarkMode ? 'bg-green-900/30 border border-green-500/30' : 'bg-green-100 border border-green-300'
          }`}>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
              Live Data - Auto-refreshing every 15 seconds
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl border animate-fade-in-up ${
        isDarkMode 
          ? 'bg-gray-900/80 border-gray-700/50' 
          : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-gray-50 to-gray-100'}`}>
              <tr>
                {['Protocol', 'Category', 'Pair/Asset', 'APY', 'TVL', 'Risk', 'Status', 'Action'].map((header) => (
                  <th key={header} className={`px-6 py-6 text-left font-bold font-space-grotesk ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {loading ? 'Loading protocols...' : 'No protocols available for this filter'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={`border-t transition-all duration-500 transform hover:scale-[1.02] hover:z-10 relative animate-table-row ${
                      isDarkMode 
                        ? 'border-gray-700/50 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:shadow-xl' 
                        : 'border-gray-200/50 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/50 hover:shadow-xl'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-4 group">
                        <div className="text-3xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                          {item.icon}
                        </div>
                        <div>
                          <span className={`font-bold text-lg font-space-grotesk ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.protocol}
                          </span>
                          <div className={`text-sm font-jetbrains ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Protocol
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold font-space-grotesk shadow-lg">
                        {item.category}
                      </span>
                    </td>
                    <td className={`px-6 py-6 font-bold font-jetbrains text-lg ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {item.pair}
                    </td>
                    <td className="px-6 py-6">
                      <div className="font-bold text-2xl bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-space-grotesk">
                        {item.apy}
                      </div>
                      <div className="text-xs text-gray-500 font-jetbrains">Annual Return</div>
                    </td>
                    <td className={`px-6 py-6 font-bold text-lg font-jetbrains ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {item.tvl}
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold font-space-grotesk shadow-md ${
                        item.risk === 'Low' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                        item.risk === 'Medium' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                        'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                      }`}>
                        {item.risk}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-2">
                        {item.isLive ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              Live
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {filteredData.map((item) => item.features && (
            <div 
              key={item.id}
              className={`p-4 rounded-xl backdrop-blur-xl border ${
                isDarkMode ? 'bg-gray-900/50 border-gray-700/50' : 'bg-white/50 border-gray-200/50'
              }`}
            >
              <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {item.protocol} Features
              </h4>
              <div className="flex flex-wrap gap-2">
                {item.features.map((feature, idx) => (
                  <span 
                    key={idx}
                    className={`text-xs px-2 py-1 rounded-lg ${
                      isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
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