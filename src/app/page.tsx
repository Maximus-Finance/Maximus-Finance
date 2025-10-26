'use client';

import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import HomePage from '@/components/pages/HomePage';
import ExploreYieldsPage from '@/components/pages/ExploreYieldsPage';
import StrategiesPage from '@/components/pages/StrategiesPage';
import ProfilePage from '@/components/pages/ProfilePage';
import { WalletProvider } from '@/providers/WalletProvider';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'home' | 'yields' | 'protocols' | 'dashboard'>('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'yields':
        return <ExploreYieldsPage />;
      case 'protocols':
        return <StrategiesPage />;
      case 'dashboard':
        return <ProfilePage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <WalletProvider>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Navigation 
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />
        {renderCurrentPage()}
        <Footer />
      </div>
    </WalletProvider>
  );
}