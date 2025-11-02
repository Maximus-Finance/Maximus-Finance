'use client';

import { useState, useMemo } from 'react';
import { Filter, Download, TrendingUp, ArrowUpDown } from 'lucide-react';
import { useLiveProtocolData } from '@/hooks/useLiveProtocolData';

const ExploreYieldsPage: React.FC = () => {
  const { opportunities, isLoading, error } = useLiveProtocolData();

  // State for filters
  const [riskFilter, setRiskFilter] = useState<'Low' | 'Medium' | 'High' | null>(null);
  const [apySort, setApySort] = useState<'asc' | 'desc' | null>(null);

  // Filter and sort handler functions
  const handleRiskFilter = () => {
    if (riskFilter === null) {
      setRiskFilter('Low');
    } else if (riskFilter === 'Low') {
      setRiskFilter('Medium');
    } else if (riskFilter === 'Medium') {
      setRiskFilter('High');
    } else {
      setRiskFilter(null);
    }
  };

  const handleApySort = () => {
    if (apySort === null) {
      setApySort('desc'); // Highest to Lowest first
    } else if (apySort === 'desc') {
      setApySort('asc'); // Lowest to Highest
    } else {
      setApySort(null); // Clear sort
    }
  };

  // Filter and sort opportunities
  const filteredAndSortedOpportunities = useMemo(() => {
    let result = [...opportunities];

    // Apply risk filter
    if (riskFilter) {
      result = result.filter(opp => opp.risk === riskFilter);
    }

    // Apply APY sort
    if (apySort) {
      result = result.sort((a, b) => {
        const apyA = parseFloat(a.apy.replace('%', ''));
        const apyB = parseFloat(b.apy.replace('%', ''));
        return apySort === 'asc' ? apyA - apyB : apyB - apyA;
      });
    }

    return result;
  }, [opportunities, riskFilter, apySort]);

  const getRiskColor = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
      case 'Low':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'High':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
    }
  };

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
            <button
              onClick={handleRiskFilter}
              className={`flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-secondary transition-colors ${riskFilter ? 'ring-2 ring-primary' : ''}`}
            >
              <Filter size={20} />
              Filter by Risk{riskFilter ? `: ${riskFilter}` : ''}
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
                      <div className="flex items-center gap-2">
                        APY
                        <button
                          onClick={handleApySort}
                          className="p-1 hover:bg-secondary rounded transition-colors"
                          title={apySort === 'desc' ? 'Highest to Lowest' : apySort === 'asc' ? 'Lowest to Highest' : 'Sort APY'}
                        >
                          <ArrowUpDown size={16} className={apySort ? 'text-primary' : 'text-muted-foreground'} />
                        </button>
                      </div>
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        Loading yield opportunities...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                        {error}
                      </td>
                    </tr>
                  ) : filteredAndSortedOpportunities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        {riskFilter ? `No ${riskFilter} risk opportunities available.` : 'No yield opportunities available at the moment.'}
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedOpportunities.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className="border-b border-border hover:bg-secondary/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {item.protocol}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{item.pair}</td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1 text-primary font-semibold">
                            <TrendingUp size={16} />
                            {item.apy}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{item.tvl}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(item.risk)}`}>
                            {item.risk}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover-lift text-sm">
                              Invest
                            </button>
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
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