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
    <section className={`py-20 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/10 to-black' 
        : 'bg-gradient-to-br from-white via-blue-50/20 to-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-5xl font-bold mb-6 font-hind hover-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Why We&apos;re Different
          </h2>
          <p className={`text-xl font-hind animate-light-float ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Three pillars that set us apart in the DeFi space
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`p-10 rounded-3xl hover-light animate-smooth-entrance transition-all duration-300 transform hover:scale-105 ${
                isDarkMode ? 'glass-3d-dark animate-light-float' : 'glass-3d animate-light-bounce'
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center mb-8 hover-light animate-gentle-rotate shadow-2xl`}>
                <feature.icon className="text-white animate-light-float" size={36} />
              </div>
              <h3 className={`text-3xl font-bold mb-6 font-hind hover-light ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
              </h3>
              <p className={`font-hind text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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