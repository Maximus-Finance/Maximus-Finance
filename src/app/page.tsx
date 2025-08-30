'use client';

import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import HomePage from '@/components/pages/HomePage';
import ExploreYieldsPage from '@/components/pages/ExploreYieldsPage';
import ExploreProtocolsPage from '@/components/pages/ExploreProtocolsPage';
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
    <div className={`min-h-screen transition-all duration-500 font-hind ${
      isDarkMode 
        ? 'dark bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white' 
        : 'light-theme bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 text-slate-900'
    }`}>
      <Navigation 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleDarkMode}
      />
      {renderCurrentPage()}
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}