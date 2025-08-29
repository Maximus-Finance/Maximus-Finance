'use client';

import { useTheme } from '@/hooks/useTheme';
import ProtocolsGrid from '@/components/sections/ProtocolsGrid';
import { PageType } from '@/types';

interface ExploreProtocolsPageProps {
  onNavigate: (page: PageType) => void;
}

const ExploreProtocolsPage: React.FC<ExploreProtocolsPageProps> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="pt-16 font-hind">
      <section className={`min-h-screen py-20 perspective-container ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-black' 
          : 'bg-gradient-to-br from-white via-blue-50/30 to-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className={`text-5xl md:text-7xl font-bold mb-8 font-hind animate-card-entrance hover-3d ${isDarkMode ? 'text-white animate-text-glow' : 'text-gray-900'}`}>
              Avalanche <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient animate-text-glow">DeFi Protocols</span>
            </h1>
            <p className={`text-xl font-hind animate-float3d ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Discover the leading protocols in the Avalanche ecosystem
            </p>
          </div>

          <ProtocolsGrid isDarkMode={isDarkMode} />

          {/* Featured Protocols */}
          <div className="mt-20">
            <h2 className={`text-4xl font-bold text-center mb-16 font-hind hover-3d ${isDarkMode ? 'text-white animate-text-glow' : 'text-gray-900'}`}>
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
                  className={`p-10 rounded-3xl text-center hover-3d animate-card-entrance shadow-2xl transform hover:scale-110 transition-all duration-500 ${
                    isDarkMode ? 'glass-3d-dark animate-float3d' : 'glass-3d animate-bubble'
                  }`}
                  style={{ animationDelay: `${index * 0.3}s` }}
                >
                  <div className="text-4xl mb-4">{protocol.icon}</div>
                  <h3 className={`text-xl font-bold mb-2 font-space-grotesk ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {protocol.name}
                  </h3>
                  <p className={`font-hind text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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
            <h2 className={`text-4xl font-bold text-center mb-16 font-hind hover-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Why Choose Our Platform?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`p-10 rounded-3xl hover-light animate-smooth-entrance shadow-2xl transition-all duration-300 ${
                isDarkMode ? 'glass-3d-dark animate-light-float' : 'glass-3d animate-light-bounce'
              }`} style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-6 hover-light animate-gentle-rotate shadow-2xl">
                    <span className="text-white text-2xl animate-light-float">⚡</span>
                  </div>
                  <div>
                    <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold font-hind hover-light animate-light-bounce">TODAY</span>
                    <h3 className={`text-3xl font-bold mt-3 font-hind hover-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Instant Yield Access
                    </h3>
                  </div>
                </div>
                <p className={`font-hind text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Currently, we direct you to the top-performing Avalanche yield platforms so you can 
                  start earning right away.
                </p>
              </div>

              <div className={`p-10 rounded-3xl hover-3d animate-card-entrance shadow-2xl transition-all duration-500 ${
                isDarkMode ? 'glass-3d-dark animate-bubble' : 'glass-3d animate-float3d'
              }`} style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-6 hover-3d animate-rotate3d shadow-2xl">
                    <span className="text-white text-2xl animate-bubble">🏛️</span>
                  </div>
                  <div>
                    <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold font-hind hover-3d animate-float3d">TOMORROW</span>
                    <h3 className={`text-3xl font-bold mt-3 font-hind hover-3d ${isDarkMode ? 'text-white animate-text-glow' : 'text-gray-900'}`}>
                      One-Click Auto-Staking
                    </h3>
                  </div>
                </div>
                <p className={`font-hind text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Deposit with us, and we&apos;ll stake your funds across protocols automatically—
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