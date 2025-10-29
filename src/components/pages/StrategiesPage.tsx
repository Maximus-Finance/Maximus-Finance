'use client';

import { useState, useEffect } from 'react';
import { CircleAlert, Users } from 'lucide-react';
import { ethers } from 'ethers';
import BenqiDepositModal from '@/components/modals/BenqiDepositModal';

const StrategiesPage: React.FC = () => {
  const [isBenqiModalOpen, setIsBenqiModalOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState<number | null>(null); // null = loading, number = actual count

  // Initialize provider and fetch stats directly
  useEffect(() => {
    const fetchInvestorCount = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          console.log('StrategiesPage: Initializing provider...');
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum as ethers.providers.ExternalProvider);

          // Get network
          const network = await web3Provider.getNetwork();
          console.log('StrategiesPage: Network:', network.chainId);

          if (network.chainId !== 43114) {
            console.log('StrategiesPage: Wrong network (not Avalanche mainnet)');
            setActiveUsers(0);
            return;
          }

          // Get vault contract
          const vaultAddress = '0x4d950c6a58314867327e22C2dc7FcD04dA52C5BD';
          const VaultABI = (await import('@/contracts/benqi/abis/VaultMainnetV2.json')).default;
          const vaultContract = new ethers.Contract(vaultAddress, VaultABI, web3Provider);

          console.log('StrategiesPage: Calling activeUserCount() on vault:', vaultAddress);
          const count = await vaultContract.activeUserCount();
          console.log('StrategiesPage: Raw response:', count);
          console.log('StrategiesPage: Converted to number:', Number(count));

          const userCount = Number(count);
          setActiveUsers(userCount);
          console.log('StrategiesPage: ✅ Successfully set activeUsers to:', userCount);
        } else {
          console.log('StrategiesPage: No ethereum provider found');
          setActiveUsers(0);
        }
      } catch (error: unknown) {
        console.error('StrategiesPage: ❌ Error fetching investor count:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch';
        console.error('StrategiesPage: Error message:', errorMessage);
        setActiveUsers(0);
      }
    };

    fetchInvestorCount();
  }, []);

  const strategies = [
    {
      name: 'Conservative Growth',
      description: 'BENQI Leveraged Yield Strategy - Automated leveraged staking',
      apy: '12.5',
      riskLevel: 'Low',
      riskColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      investors: activeUsers === null ? 'Loading...' : activeUsers.toLocaleString(),
      allocations: [
        { name: 'BENQI', percentage: 100 },
      ],
    },
    {
      name: 'Stablecoin Optimizer',
      description: 'Specialized strategy for stablecoin yields',
      apy: '9.7',
      riskLevel: 'Low',
      riskColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      investors: '0',
      allocations: [
        { name: 'Curve', percentage: 45 },
        { name: 'Platypus', percentage: 35 },
        { name: 'Aave', percentage: 20 },
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
                          Risk Level
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${strategy.riskColor}`}
                      >
                        {strategy.riskLevel}
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
                  <button
                    onClick={() => {
                      if (strategy.name === 'Conservative Growth') {
                        setIsBenqiModalOpen(true);
                      }
                    }}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover-lift transition-all duration-300 mt-auto"
                  >
                    Deploy Strategy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BenqiDepositModal
        isOpen={isBenqiModalOpen}
        onClose={() => setIsBenqiModalOpen(false)}
      />
    </main>
  );
};

export default StrategiesPage;
