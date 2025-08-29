'use client';

interface StatsSectionProps {
  isDarkMode: boolean;
}

const StatsSection: React.FC<StatsSectionProps> = ({ isDarkMode }) => {
  const stats = [
    { value: '$304.3M', label: 'Total Value Locked', color: 'text-green-500' },
    { value: '18.2%', label: 'Average APY', color: 'text-blue-500' },
    { value: '24', label: 'Active Protocols', color: 'text-purple-500' },
  ];

  return (
    <section className={`py-20 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900/50 via-purple-900/10 to-gray-900/50' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`p-10 rounded-3xl text-center hover-light animate-smooth-entrance ${
                isDarkMode ? 'glass-3d-dark animate-light-float' : 'glass-3d animate-light-bounce'
              } shadow-2xl transform hover:scale-105 transition-all duration-300`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`text-5xl font-bold ${stat.color} mb-4 font-hind hover-light`}>
                {stat.value}
              </div>
              <div className={`font-hind text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;