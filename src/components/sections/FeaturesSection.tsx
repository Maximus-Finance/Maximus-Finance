'use client';

import { Zap, BarChart3, Shield } from 'lucide-react';

interface FeaturesSectionProps {
  isDarkMode: boolean;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ isDarkMode }) => {
  const features = [
    {
      icon: Zap,
      title: 'Unmatched Efficiency',
      description: 'Our advanced algorithms scan hundreds of protocols simultaneously, ensuring you never miss the best opportunities. We optimize gas costs and execution paths for maximum efficiency.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analysis',
      description: 'Live market data, instant risk assessment, and dynamic yield calculations. Our platform updates every second to give you the most current information for informed decisions.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: 'Security First',
      description: 'Built with institutional-grade security standards. We audit every protocol, assess smart contract risks, and provide transparent safety scores for all yield opportunities.',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-4xl font-bold mb-4 font-space-grotesk ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Why We're Different
          </h2>
          <p className={`text-xl font-space-grotesk ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Three pillars that set us apart in the DeFi space
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`p-8 rounded-2xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              } hover:transform hover:scale-105 transition-all duration-300 animate-slide-in`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center mb-6`}>
                <feature.icon className="text-white" size={32} />
              </div>
              <h3 className={`text-2xl font-bold mb-4 font-space-grotesk ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
              </h3>
              <p className={`font-space-grotesk ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;