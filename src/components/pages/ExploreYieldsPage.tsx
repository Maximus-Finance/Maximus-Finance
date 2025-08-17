'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import YieldsTable from '@/components/sections/YieldsTable';
import { ProtocolAggregator, AggregatedData } from '@/components/protocols/ProtocolAggregator';

const ExploreYieldsPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [protocolData, setProtocolData] = useState<AggregatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalMetrics, setTotalMetrics] = useState({
    totalTVL: 0,
    averageAPY: 0,
    activeProtocols: 0
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const aggregator = new ProtocolAggregator();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await aggregator.fetchAllProtocolData();
        setProtocolData(data);
        
        const metrics = aggregator.calculateTotalMetrics(data);
        setTotalMetrics(metrics);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch protocol data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Refresh every 15 seconds
    const interval = setInterval(fetchData, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-16">
      <section className={`min-h-screen py-20 ${
        isDarkMode 
          ? 'bg-gradient-radial from-black via-gray-900 to-black' 
          : 'bg-gradient-radial from-white via-gray-50 to-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 font-space-grotesk ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Explore <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">Live Yields</span>
            </h1>
            <p className={`text-xl font-space-grotesk ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Real-time yield opportunities across the Avalanche ecosystem
            </p>
            
            {/* Live Status Indicator */}
            <div className="flex items-center justify-center mt-4 space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {loading ? 'Updating...' : 'Live Data'}
                </span>
              </div>
              {lastUpdated && (
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <YieldsTable isDarkMode={isDarkMode} protocolData={protocolData} loading={loading} />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { 
                value: `$${(totalMetrics.totalTVL / 1000000).toFixed(1)}M`, 
                label: 'Total Value Locked', 
                gradient: 'from-green-400 to-emerald-500' 
              },
              { 
                value: `${totalMetrics.averageAPY.toFixed(1)}%`, 
                label: 'Average APY', 
                gradient: 'from-blue-400 to-cyan-500' 
              },
              { 
                value: totalMetrics.activeProtocols.toString(), 
                label: 'Active Protocols', 
                gradient: 'from-purple-400 to-pink-500' 
              },
            ].map((stat, index) => (
              <div 
                key={index}
                className={`p-8 rounded-3xl text-center backdrop-blur-xl border shadow-2xl transform hover:scale-105 transition-all duration-300 animate-slide-in ${
                  isDarkMode ? 'bg-gray-900/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-3 font-space-grotesk`}>
                  {loading ? '...' : stat.value}
                </div>
                <div className={`font-space-grotesk font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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