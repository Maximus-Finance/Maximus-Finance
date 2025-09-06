'use client';

import { Zap, BarChart3, Shield } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface FeaturesSectionProps {}

const FeaturesSection: React.FC<FeaturesSectionProps> = () => {
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
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-4xl font-bold mb-4 sm:mb-6 font-instrument-sans text-white">
            Why We&apos;re Different
          </h2>
          <p className="text-lg sm:text-xl font-instrument-sans px-4 sm:px-0 text-gray-400">
            Three pillars that set us apart in the DeFi space
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 sm:p-8 transition-all duration-200 transform sm:hover:scale-[1.02] asgard-card"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="text-white" size={20} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 font-instrument-sans text-white">
                {feature.title}
              </h3>
              <p className="font-instrument-sans text-sm sm:text-base text-gray-400">
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