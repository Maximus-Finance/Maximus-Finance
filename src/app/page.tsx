'use client';

import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import HomePage from '@/components/pages/HomePage';
import ExploreYieldsPage from '@/components/pages/ExploreYieldsPage';
import ExploreProtocolsPage from '@/components/pages/ExploreProtocolsPage';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { useTheme } from '@/hooks/useTheme';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'home' | 'yields' | 'protocols'>('home');
  const { isDarkMode, toggleDarkMode } = useTheme();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'yields':
        return <ExploreYieldsPage />;
      case 'protocols':
        return <ExploreProtocolsPage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 font-hind relative ${
      isDarkMode 
        ? 'dark text-white bg-gray-900' 
        : 'light-theme text-slate-900 bg-white'
    }`}>
      <ParticleBackground isDarkMode={isDarkMode} />
      <div className="relative z-10">
        <Navigation 
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleDarkMode}
        />
        {renderCurrentPage()}
        <Footer isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}