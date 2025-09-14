'use client';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface StatsSectionProps {}

const StatsSection: React.FC<StatsSectionProps> = () => {
  const stats = [
    { value: '$304.3M', label: 'Total Value Locked', color: 'text-green-500' },
    { value: '18.2%', label: 'Average APY', color: 'text-blue-500' },
    { value: '24', label: 'Active Protocols', color: 'text-purple-500' },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="p-6 sm:p-8 text-center transition-all duration-300 glass-card rounded-2xl transform sm:hover:scale-[1.02]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`text-3xl sm:text-4xl lg:text-4xl font-bold ${stat.color} mb-3 sm:mb-4 font-instrument-sans`}>
                {stat.value}
              </div>
              <div className="font-instrument-sans text-sm sm:text-base font-medium text-gray-400">
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