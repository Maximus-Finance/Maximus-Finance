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
    <section className={`py-20 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`p-8 rounded-2xl text-center ${
                isDarkMode ? 'bg-gray-900/50' : 'bg-white'
              } shadow-lg hover:transform hover:scale-105 transition-all duration-300 animate-slide-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`text-4xl font-bold ${stat.color} mb-2 font-space-grotesk`}>
                {stat.value}
              </div>
              <div className={`font-space-grotesk ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
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