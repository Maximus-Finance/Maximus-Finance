'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import ThemeToggle from './ThemeToggle';
import Button from '@/components/ui/Button';
import { NavigationProps } from '@/types';
import { useWalletConnect } from '@/hooks/useWalletConnect';

const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  isDarkMode,
  onToggleTheme,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { buttonText, handleClick } = useWalletConnect();

  const navItems = [
    { id: 'home' as const, label: 'Home' },
    { id: 'yields' as const, label: 'Explore Yields' },
    { id: 'protocols' as const, label: 'Explore Protocols' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isDarkMode 
        ? 'glass-3d-dark animate-background-shift' 
        : 'glass-3d animate-background-shift'
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
                className={`px-6 py-3 rounded-2xl transition-all duration-300 font-hind font-semibold hover-light ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white shadow-2xl animate-subtle-glow'
                    : isDarkMode
                    ? 'text-gray-300 hover:text-white glass-3d-dark'
                    : 'text-gray-600 hover:text-gray-900 glass-3d'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
            <Button onClick={handleClick}>{buttonText}</Button>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-3 rounded-2xl transition-all duration-300 hover-light ${
                isDarkMode ? 'glass-3d-dark' : 'glass-3d'
              }`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className={`md:hidden transition-all duration-300 animate-smooth-entrance ${
          isDarkMode ? 'glass-3d-dark' : 'glass-3d'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { 
                  onNavigate(item.id); 
                  setIsMenuOpen(false); 
                }}
                className={`block w-full text-left px-4 py-3 rounded-2xl font-hind font-medium transition-all duration-300 hover-light ${
                  currentPage === item.id 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white animate-subtle-glow' 
                    : isDarkMode 
                    ? 'text-gray-300 glass-3d-dark' 
                    : 'text-gray-600 glass-3d'
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