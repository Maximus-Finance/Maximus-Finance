'use client';

import { useTheme } from '@/hooks/useTheme';
import ProtocolsGrid from '@/components/sections/ProtocolsGrid';
import { TrendingUp } from 'lucide-react';
import { PageType } from '@/types';

interface ExploreProtocolsPageProps {
  onNavigate: (page: PageType) => void;
}

const ExploreProtocolsPage: React.FC<ExploreProtocolsPageProps> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme();

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
              Avalanche <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">DeFi Protocols</span>
            </h1>
            <p className={`text-xl font-space-grotesk ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Discover the leading protocols in the Avalanche ecosystem
            </p>
          </div>

          <ProtocolsGrid isDarkMode={isDarkMode} />

          {/* Featured Protocols */}
          <div className="mt-20">
            <h2 className={`text-3xl font-bold text-center mb-12 font-space-grotesk ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Featured Protocols
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: '🔺', name: 'Trader Joe', desc: 'Leading DEX with $45.2M TVL', apy: '24.5% APY' },
                { icon: '🏔️', name: 'Benqi', desc: 'Liquid staking with $125.8M TVL', apy: '8.2% APY' },
                { icon: '🐧', name: 'Pangolin', desc: 'Community DEX with $12.4M TVL', apy: '18.7% APY' },
              ].map((protocol, index) => (
                <div 
                  key={index}
                  className={`p-8 rounded-2xl text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-slide-in ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl mb-4">{protocol.icon}</div>
                  <h3 className={`text-xl font-bold mb-2 font-space-grotesk ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {protocol.name}
                  </h3>
                  <p className={`font-space-grotesk ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {protocol.desc}
                  </p>
                  <p className={`text-lg font-semibold mt-2 font-space-grotesk ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {protocol.apy}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-20">
            <h2 className={`text-3xl font-bold text-center mb-12 font-space-grotesk ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Why Choose Our Platform?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`p-8 rounded-2xl shadow-lg animate-slide-in ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-xl">⚡</span>
                  </div>
                  <div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium font-space-grotesk">TODAY</span>
                    <h3 className={`text-2xl font-bold mt-2 font-space-grotesk ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Instant Yield Access
                    </h3>
                  </div>
                </div>
                <p className={`font-space-grotesk ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Currently, we direct you to the top-performing Avalanche yield platforms so you can 
                  start earning right away.
                </p>
              </div>

              <div className={`p-8 rounded-2xl shadow-lg animate-slide-in ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-xl">🏛️</span>
                  </div>
                  <div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium font-space-grotesk">TOMORROW</span>
                    <h3 className={`text-2xl font-bold mt-2 font-space-grotesk ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      One-Click Auto-Staking
                    </h3>
                  </div>
                </div>
                <p className={`font-space-grotesk ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Deposit with us, and we'll stake your funds across protocols automatically—
                  optimizing returns without you lifting a finger.
                </p>
              </div>
            </div>

            <div className="mt-12">
              <div className={`p-8 rounded-2xl text-white shadow-2xl animate-fade-in-up ${
                isDarkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}>
                <h3 className="text-3xl font-bold mb-4 font-space-grotesk">
                  Your Avalanche yield journey starts here.
                </h3>
                <p className="text-xl mb-8 text-blue-100 font-space-grotesk">
                  Stop searching, start earning.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => onNavigate('yields')}
                    className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 font-space-grotesk"
                  >
                    Start Earning Now
                  </button>
                  <button 
                    onClick={() => onNavigate('yields')}
                    className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 font-space-grotesk"
                  >
                    View Live Yields
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