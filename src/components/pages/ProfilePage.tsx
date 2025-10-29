'use client';

import { useState, useEffect } from 'react';
import { Settings, Wallet, TrendingUp, ChartColumn, X } from 'lucide-react';
import { PageType } from '@/types';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useBenqiBalance } from '@/hooks/benqi/useBenqiBalance';
import type { BenqiBalance } from '@/types/benqi';

interface ProfilePageProps {
  onNavigate: (page: PageType) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const { address: account } = useAccount();
  const [showWithdrawPopup, setShowWithdrawPopup] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  // Initialize provider
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum as ethers.providers.ExternalProvider);
      setProvider(web3Provider);
    }
  }, []);

  // Fetch BENQI balance
  const { balance: benqiBalance } = useBenqiBalance(provider, account || '', true) as {
    balance: BenqiBalance | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<BenqiBalance | null>;
  };

  // Calculate totals including BENQI position
  const benqiShares = benqiBalance ? parseFloat(benqiBalance.shares) : 0;
  const benqiInvested = benqiBalance ? parseFloat(benqiBalance.depositAmount) : 0;
  const benqiCurrent = benqiBalance ? parseFloat(benqiBalance.currentBalance) : 0;
  const benqiProfit = benqiBalance ? parseFloat(benqiBalance.profit) : 0;

  const investments = [
    ...(benqiBalance && benqiInvested > 0 ? [{
      protocol: 'BENQI',
      invested: `${benqiInvested.toFixed(4)} AVAX`,
      apy: '12.5%',
      earned: `+${benqiProfit.toFixed(8)} AVAX`,
      current: `${benqiCurrent.toFixed(4)} AVAX`,
      shares: `${benqiShares.toFixed(4)}`
    }] : [])
  ];

  return (
    <main className="min-h-screen bg-background">
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl font-bold text-foreground mb-2">Dashboard</h1>
              <p className="text-lg text-muted-foreground">
                Manage your investments and track performance
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover-lift">
              <Settings size={20} />
              Settings
            </button>
          </div>
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-6 hover-lift animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Your Shares
                </h3>
                <Wallet className="text-primary" size={20} />
              </div>
              <div className="text-3xl font-bold text-foreground">
                {benqiShares > 0 ? benqiShares.toFixed(4) : '0.0000'}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Vault shares owned</p>
            </div>
            <div
              className="bg-card border border-border rounded-xl p-6 hover-lift animate-fade-in-up"
              style={{ animationDelay: '50ms' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Amount Invested
                </h3>
                <Wallet className="text-primary" size={20} />
              </div>
              <div className="text-3xl font-bold text-foreground">
                {benqiInvested > 0 ? `${benqiInvested.toFixed(4)} AVAX` : '0.0000 AVAX'}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Original deposit</p>
            </div>
            <div
              className="bg-card border border-border rounded-xl p-6 hover-lift animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Total Earned
                </h3>
                <TrendingUp className="text-primary" size={20} />
              </div>
              <div className="text-3xl font-bold text-foreground">
                {benqiProfit > 0 ? `+${benqiProfit.toFixed(8)} AVAX` : '0.00000000 AVAX'}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                All time earnings
              </p>
            </div>
            <div
              className="bg-card border border-border rounded-xl p-6 hover-lift animate-fade-in-up"
              style={{ animationDelay: '150ms' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Current APY
                </h3>
                <ChartColumn className="text-primary" size={20} />
              </div>
              <div className="text-3xl font-bold text-foreground">12.5%</div>
              <p className="text-sm text-muted-foreground mt-2">BENQI Leveraged</p>
            </div>
            <div
              className="bg-card border border-border rounded-xl p-6 hover-lift animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Active Strategies
                </h3>
                <Settings className="text-primary" size={20} />
              </div>
              <div className="text-3xl font-bold text-foreground">
                {benqiInvested > 0 ? '1' : '0'}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {benqiInvested > 0 ? 'Running smoothly' : 'No active positions'}
              </p>
            </div>
          </div>
          <div
            className="bg-card border border-border rounded-xl p-8 animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Active Investments
            </h2>
            {investments.length > 0 ? (
              <div className="space-y-4">
                {investments.map((investment, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-5 gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {investment.protocol}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        APY: <span className="font-semibold text-primary">{investment.apy}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Shares</p>
                      <p className="text-sm font-semibold text-foreground">
                        {investment.shares}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Deposited</p>
                      <p className="text-sm font-semibold text-foreground">
                        {investment.invested}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                      <p className="text-sm font-semibold text-foreground">
                        {investment.current}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Profit</p>
                      <p className="text-sm font-semibold text-green-600">
                        {investment.earned}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No active investments yet</p>
                <p className="text-sm text-muted-foreground">Deploy a strategy to start earning yields</p>
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <button className="px-6 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover-lift">
              Deposit More
            </button>
            <button className="px-6 py-4 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300" onClick={() => setShowWithdrawPopup(true)}>
              Withdraw
            </button>
            <button className="px-6 py-4 border-2 border-border text-foreground rounded-lg font-semibold hover:bg-secondary transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </section>
      {showWithdrawPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full relative animate-fade-in-up">
            <button
              onClick={() => setShowWithdrawPopup(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-foreground mb-4">Withdraw</h2>
            <p className="text-muted-foreground mb-6">This feature is coming soon</p>
            <button
              onClick={() => setShowWithdrawPopup(false)}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProfilePage;
