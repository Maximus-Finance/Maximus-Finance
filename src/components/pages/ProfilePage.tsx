'use client';

import { Settings, Wallet, TrendingUp, ChartColumn } from 'lucide-react';
import { PageType } from '@/types';

interface ProfilePageProps {
  onNavigate: (page: PageType) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const investments = [
    { protocol: 'Aave', invested: '$45,000', apy: '12.5%', earned: '$2,340' },
    { protocol: 'Curve', invested: '$35,000', apy: '18.3%', earned: '$2,890' },
    { protocol: 'Benqi', invested: '$25,000', apy: '15.8%', earned: '$1,580' },
    { protocol: 'Trader Joe', invested: '$20,430', apy: '22.1%', earned: '$1,424' },
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
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-6 hover-lift animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Total Value Locked
                </h3>
                <Wallet className="text-primary" size={20} />
              </div>
              <div className="text-3xl font-bold text-foreground">$125,430</div>
              <p className="text-sm text-muted-foreground mt-2">+2.5% this month</p>
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
              <div className="text-3xl font-bold text-foreground">$8,234</div>
              <p className="text-sm text-muted-foreground mt-2">
                All time earnings
              </p>
            </div>
            <div
              className="bg-card border border-border rounded-xl p-6 hover-lift animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Current APY
                </h3>
                <ChartColumn className="text-primary" size={20} />
              </div>
              <div className="text-3xl font-bold text-foreground">18.5%</div>
              <p className="text-sm text-muted-foreground mt-2">Weighted average</p>
            </div>
            <div
              className="bg-card border border-border rounded-xl p-6 hover-lift animate-fade-in-up"
              style={{ animationDelay: '300ms' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Active Strategies
                </h3>
                <Settings className="text-primary" size={20} />
              </div>
              <div className="text-3xl font-bold text-foreground">3</div>
              <p className="text-sm text-muted-foreground mt-2">Running smoothly</p>
            </div>
          </div>
          <div
            className="bg-card border border-border rounded-xl p-8 animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Active Investments
            </h2>
            <div className="space-y-4">
              {investments.map((investment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-secondary-30 rounded-lg hover:bg-secondary-50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {investment.protocol}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Invested: {investment.invested}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">{investment.apy}</div>
                    <p className="text-sm text-muted-foreground">
                      Earned: {investment.earned}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <button className="px-6 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover-lift">
              Deposit More
            </button>
            <button className="px-6 py-4 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              Withdraw
            </button>
            <button className="px-6 py-4 border-2 border-border text-foreground rounded-lg font-semibold hover:bg-secondary transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
