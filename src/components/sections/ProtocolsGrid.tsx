'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { protocolData } from '@/data/protocolData';
import Button from '@/components/ui/Button';

interface ProtocolsGridProps {
  isDarkMode: boolean;
}

const ProtocolsGrid: React.FC<ProtocolsGridProps> = ({ isDarkMode }) => {
  const [expandedProtocol, setExpandedProtocol] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {protocolData.map((protocol) => (
        <div
          key={protocol.id}
          className={`relative overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer ${
            isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
          } shadow-lg hover:shadow-2xl animate-slide-in`}
          style={{ animationDelay: `${protocol.id * 0.1}s` }}
          onMouseEnter={() => setExpandedProtocol(protocol.id)}
          onMouseLeave={() => setExpandedProtocol(null)}
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{protocol.icon}</span>
                <div>
                  <h3 className={`text-xl font-bold font-space-grotesk ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {protocol.name}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium font-space-grotesk">
                    {protocol.category}
                  </span>
                </div>
              </div>
              <ExternalLink className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className={`text-sm font-space-grotesk ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>TVL</div>
                <div className={`text-lg font-bold font-space-grotesk ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{protocol.tvl}</div>
              </div>
              <div>
                <div className={`text-sm font-space-grotesk ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>APY</div>
                <div className="text-lg font-bold text-green-500 font-space-grotesk">{protocol.apy}</div>
              </div>
            </div>

            <p className={`text-sm font-space-grotesk ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              {protocol.description}
            </p>

            {/* Expanded Content */}
            <div className={`transition-all duration-500 overflow-hidden ${
              expandedProtocol === protocol.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className={`font-semibold mb-3 font-space-grotesk ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Key Features:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {protocol.features.map((feature, index) => (
                    <div key={index} className={`text-xs px-2 py-1 rounded font-space-grotesk ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button size="sm" className="w-full">
                    Explore Protocol
                  </Button>
                </div>
              </div>
            </div>

            {/* Static Button for Non-expanded State */}
            {expandedProtocol !== protocol.id && (
              <Button size="sm" className="w-full mt-4">
                View Details
              </Button>
            )}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      ))}
    </div>
  );
};

export default ProtocolsGrid;