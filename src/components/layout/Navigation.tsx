'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import ThemeToggle from './ThemeToggle';
import Button from '@/components/ui/Button';
import { NavigationProps } from '@/types';

const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  isDarkMode,
  onToggleTheme,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home' as const, label: 'Home' },
    { id: 'yields' as const, label: 'Explore Yields' },
    { id: 'protocols' as const, label: 'Explore Protocols' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-black/90 backdrop-blur-xl border-b border-gray-800/50' 
        : 'bg-white/90 backdrop-blur-xl border-b border-gray-200/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo onNavigate={onNavigate} />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 font-space-grotesk font-medium ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800/80 hover:shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 hover:shadow-lg'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
            <Button>Connect Wallet</Button>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-800/20 transition-all duration-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className={`md:hidden ${isDarkMode ? 'bg-black/95' : 'bg-white/95'} border-t ${isDarkMode ? 'border-gray-800/50' : 'border-gray-200/50'} backdrop-blur-xl`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { 
                  onNavigate(item.id); 
                  setIsMenuOpen(false); 
                }}
                className={`block w-full text-left px-3 py-2 rounded-xl font-space-grotesk font-medium transition-all duration-300 ${
                  currentPage === item.id 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-800' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;