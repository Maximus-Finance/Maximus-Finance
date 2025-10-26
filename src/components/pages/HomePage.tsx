'use client';

import { ArrowRight, TrendingUp, Zap, Shield } from 'lucide-react';
import { PageType } from '@/types';

interface HomePageProps {
  onNavigate: (page: PageType) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 px-4">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Maximize Your <span className="text-primary">Avalanche Yields</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We scan the entire Avalanche DeFi ecosystem in real time,
                compare every yield opportunity, and guide you to the highest
                returns. Instantly, Intelligently, Effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onNavigate('yields')}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover-lift inline-flex items-center justify-center gap-2"
                >
                  Find Best Yield Now
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => onNavigate('yields')}
                  className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  View Live Yields
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 animate-slide-in-right">
              <div className="bg-card border border-border rounded-xl p-6 hover-lift">
                <div className="text-3xl font-bold text-primary mb-2">$304.3M</div>
                <p className="text-sm text-muted-foreground">Total Value Locked</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 hover-lift">
                <div className="text-3xl font-bold text-primary mb-2">18.2%</div>
                <p className="text-sm text-muted-foreground">Average APY</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 hover-lift">
                <div className="text-3xl font-bold text-primary mb-2">24</div>
                <p className="text-sm text-muted-foreground">Active Protocols</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 hover-lift">
                <div className="text-3xl font-bold text-primary mb-2">Real-time</div>
                <p className="text-sm text-muted-foreground">Market Analysis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 px-4" style={{ backgroundColor: '#f1f5f9' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why We&#x27;re Different
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three pillars that set us apart in the DeFi space
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover-lift animate-fade-in-up">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(231, 231, 231)' }}>
                <TrendingUp className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unmatched Efficiency
              </h3>
              <p className="text-sm text-gray-600">
                Our advanced algorithms scan hundreds of protocols
                simultaneously, ensuring you never miss the best opportunities.
                We optimize gas costs and execution paths for maximum
                efficiency.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover-lift animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(231, 231, 231)' }}>
                <Zap className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-Time Analysis
              </h3>
              <p className="text-sm text-gray-600">
                Live market data, instant risk assessment, and dynamic yield
                calculations. Our platform updates every second to give you the
                most current information for informed decisions.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover-lift animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(231, 231, 231)' }}>
                <Shield className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Security First
              </h3>
              <p className="text-sm text-gray-600">
                Built with institutional-grade security standards. We audit
                every protocol, assess smart contract risks, and provide
                transparent safety scores for all yield opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-12 md:p-16 text-center animate-fade-in-up bg-above-footer">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              While others give you data, we give you the decision.
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-300">
              Start optimizing your Avalanche yields today with Maximus Finance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('yields')}
                className="px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover-scale"
              >
                Start Optimizing Now
              </button>
              <button
                onClick={() => onNavigate('protocols')}
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 inline-flex items-center justify-center gap-2"
              >
                Explore Protocols
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;