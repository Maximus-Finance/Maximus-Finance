'use client';

import { CircleAlert, Users } from 'lucide-react';

const StrategiesPage: React.FC = () => {
  const strategies = [
    {
      name: 'Conservative Growth',
      description: 'Low-risk strategy focused on stable yields',
      apy: '12.3',
      riskScore: 2,
      riskColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      investors: '1,240',
      allocations: [
        { name: 'Aave', percentage: 40 },
        { name: 'Curve', percentage: 35 },
        { name: 'Benqi', percentage: 25 },
      ],
    },
    {
      name: 'Balanced Yield',
      description: 'Medium-risk strategy balancing growth and stability',
      apy: '22.8',
      riskScore: 5,
      riskColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      investors: '856',
      allocations: [
        { name: 'Trader Joe', percentage: 35 },
        { name: 'Aave', percentage: 30 },
        { name: 'Balancer', percentage: 20 },
        { name: 'Platypus', percentage: 15 },
      ],
    },
    {
      name: 'Aggressive Farming',
      description: 'High-risk strategy targeting maximum returns',
      apy: '38.5',
      riskScore: 8,
      riskColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      investors: '423',
      allocations: [
        { name: 'Pangolin', percentage: 40 },
        { name: 'Yield Yak', percentage: 35 },
        { name: 'Trader Joe', percentage: 25 },
      ],
    },
    {
      name: 'Stablecoin Optimizer',
      description: 'Specialized strategy for stablecoin yields',
      apy: '9.7',
      riskScore: 1,
      riskColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      investors: '2,103',
      allocations: [
        { name: 'Curve', percentage: 45 },
        { name: 'Platypus', percentage: 35 },
        { name: 'Aave', percentage: 20 },
      ],
    },
    {
      name: 'Multi-Asset Diversification',
      description: 'Diversified across multiple asset types',
      apy: '18.9',
      riskScore: 4,
      riskColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      investors: '1,567',
      allocations: [
        { name: 'Aave', percentage: 25 },
        { name: 'Trader Joe', percentage: 25 },
        { name: 'Balancer', percentage: 25 },
        { name: 'Curve', percentage: 25 },
      ],
    },
    {
      name: 'Premium Yield Stack',
      description: 'Curated selection of top-performing protocols',
      apy: '31.2',
      riskScore: 6,
      riskColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      investors: '678',
      allocations: [
        { name: 'Yield Yak', percentage: 30 },
        { name: 'Trader Joe', percentage: 30 },
        { name: 'Balancer', percentage: 20 },
        { name: 'Benqi', percentage: 20 },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 animate-fade-in-up">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Investment Strategies
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose a strategy that matches your risk tolerance and investment
              goals
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map((strategy, index) => (
              <div
                key={index}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-card border border-border rounded-xl p-6 hover-lift group h-full flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {strategy.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {strategy.description}
                    </p>
                  </div>
                  <div className="mb-4 p-4 bg-primary-5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {strategy.apy}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Expected Annual Yield
                    </p>
                  </div>
                  <div className="mb-4 pb-4 border-b border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">
                      Allocation
                    </p>
                    <div className="space-y-2">
                      {strategy.allocations.map((allocation, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm text-foreground">
                            {allocation.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${allocation.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-foreground w-8 text-right">
                              {allocation.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 pb-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CircleAlert
                          className="text-muted-foreground"
                          size={16}
                        />
                        <span className="text-sm text-muted-foreground">
                          Risk Score
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${strategy.riskColor}`}
                      >
                        {strategy.riskScore}/10
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users
                          className="text-muted-foreground"
                          size={16}
                        />
                        <span className="text-sm text-muted-foreground">
                          Investors
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {strategy.investors}
                      </span>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover-lift transition-all duration-300 mt-auto">
                    Deploy Strategy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default StrategiesPage;
