'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
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
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const { buttonText, isConnected, address, handleClick } = useWalletConnect();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsWalletDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWalletButtonClick = () => {
    if (isConnected) {
      setIsWalletDropdownOpen(!isWalletDropdownOpen);
    } else {
      handleClick();
    }
  };

  const handleDisconnect = () => {
    handleClick(); // This will disconnect since isConnected is true
    setIsWalletDropdownOpen(false);
  };

  const handleProfileClick = () => {
    onNavigate('profile');
    setIsWalletDropdownOpen(false);
  };

  const navItems = [
    { id: 'home' as const, label: 'Home' },
    { id: 'yields' as const, label: 'Explore Yields' },
    { id: 'protocols' as const, label: 'Yield Strategies' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isDarkMode 
        ? 'glass-3d-dark animate-background-shift' 
        : 'glass-3d-light animate-background-shift'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo onNavigate={onNavigate} />
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-6 py-3 rounded-2xl transition-all duration-300 font-hind font-semibold hover-light ${
                  currentPage === item.id
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                    : isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700 bg-gray-800'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-gray-200 bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block">
              <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
            </div>
            <div className="hidden sm:block relative" ref={dropdownRef}>
              <Button onClick={handleWalletButtonClick}>{buttonText}</Button>
              {isConnected && isWalletDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg z-50 ${
                  isDarkMode ? 'glass-3d-dark border border-gray-600' : 'glass-3d-light border border-gray-200'
                }`}>
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className={`flex items-center w-full px-4 py-2 text-left hover:bg-opacity-80 transition-colors ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className={`flex items-center w-full px-4 py-2 text-left hover:bg-opacity-80 transition-colors ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 sm:p-3 rounded-2xl transition-all duration-300 hover-light ${
                isDarkMode ? 'glass-3d-dark' : 'glass-3d-light'
              }`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className={`md:hidden transition-all duration-300 animate-smooth-entrance ${
          isDarkMode ? 'glass-3d-dark' : 'glass-3d-light'
        }`}>
          <div className="px-4 pt-4 pb-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { 
                  onNavigate(item.id); 
                  setIsMenuOpen(false); 
                }}
                className={`block w-full text-left px-4 py-3 rounded-2xl font-hind font-medium transition-all duration-300 hover-light ${
                  currentPage === item.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-slate-700 hover:text-slate-900 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="pt-3 border-t border-gray-200/20 space-y-2">
              <div className="flex justify-center">
                <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
              </div>
              <div className="flex justify-center">
                {isConnected ? (
                  <div className="w-full max-w-xs space-y-2">
                    <Button onClick={handleWalletButtonClick} size="sm" className="w-full">
                      {buttonText}
                    </Button>
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center justify-center w-full px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        handleClick();
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center justify-center w-full px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </button>
                  </div>
                ) : (
                  <Button onClick={handleClick} size="sm" className="w-full max-w-xs">
                    {buttonText}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;