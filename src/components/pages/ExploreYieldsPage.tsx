'use client';

import { Filter, Download, TrendingUp } from 'lucide-react';

const ExploreYieldsPage: React.FC = () => {
  const yields = [
    { protocol: 'Aave', token: 'AVAX', apy: '12.5%', tvl: '$450M', risk: 'Low', riskColor: 'bg-green-500/20 text-green-700 dark:text-green-400' },
    { protocol: 'Curve', token: 'USDC', apy: '18.3%', tvl: '$320M', risk: 'Low', riskColor: 'bg-green-500/20 text-green-700 dark:text-green-400' },
    { protocol: 'Benqi', token: 'AVAX', apy: '15.8%', tvl: '$280M', risk: 'Medium', riskColor: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' },
    { protocol: 'Trader Joe', token: 'JOE', apy: '22.1%', tvl: '$210M', risk: 'Medium', riskColor: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' },
    { protocol: 'Platypus', token: 'PTP', apy: '28.5%', tvl: '$180M', risk: 'High', riskColor: 'bg-red-500/20 text-red-700 dark:text-red-400' },
    { protocol: 'Balancer', token: 'BAL', apy: '16.2%', tvl: '$150M', risk: 'Low', riskColor: 'bg-green-500/20 text-green-700 dark:text-green-400' },
  ];

  return (
    <main className="min-h-screen bg-background">
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 animate-fade-in-up">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Available Yields
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore the best yield opportunities across Avalanche DeFi
              protocols
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-secondary transition-colors">
              <Filter size={20} />
              Filter by Risk
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-secondary transition-colors">
              <Download size={20} />
              Export Data
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Protocol
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Token
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      APY
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      TVL
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Risk Level
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {yields.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-border hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {item.protocol}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{item.token}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          <TrendingUp size={16} />
                          {item.apy}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{item.tvl}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.riskColor}`}>
                          {item.risk}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover-lift text-sm">
                          Invest
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ExploreYieldsPage;