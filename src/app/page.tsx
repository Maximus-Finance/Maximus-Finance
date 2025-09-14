'use client';

import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import HomePage from '@/components/pages/HomePage';
import ExploreYieldsPage from '@/components/pages/ExploreYieldsPage';
import ExploreProtocolsPage from '@/components/pages/ExploreProtocolsPage';
import ProfilePage from '@/components/pages/ProfilePage';
import ParticleBackground from '@/components/ui/ParticleBackground';
import WalletProvider from '@/context/WalletContext';
import { ThemeProvider } from '@/context/ThemeContext';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'home' | 'yields' | 'protocols' | 'profile'>('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'yields':
        return <ExploreYieldsPage />;
      case 'protocols':
        return <ExploreProtocolsPage onNavigate={setCurrentPage} />;
      case 'profile':
        return <ProfilePage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider>
      <WalletProvider>
        <div className="min-h-screen transition-all duration-300 font-instrument-sans relative asgard-dark">
          <ParticleBackground />
          <div className="relative z-10">
            <Navigation 
              currentPage={currentPage}
              onNavigate={setCurrentPage}
            />
            {renderCurrentPage()}
            <Footer />
          </div>
        </div>
      </WalletProvider>
    </ThemeProvider>
  );
}