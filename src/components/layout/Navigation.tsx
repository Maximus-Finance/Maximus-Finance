'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { NavigationProps } from '@/types';
import { useWalletConnect } from '@/hooks/useWalletConnect';

const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const { buttonText, isConnected, handleClick } = useWalletConnect();
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
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo onNavigate={onNavigate} />
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 font-instrument-sans font-medium nav-link ${
                  currentPage === item.id
                    ? 'glass-button-primary text-white' 
                    : 'glass-button hover:glass-button'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <div className="hidden sm:block relative" ref={dropdownRef}>
              <Button onClick={handleWalletButtonClick}>{buttonText}</Button>
              {isConnected && isWalletDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg z-50 glass-card">
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-4 py-2 text-left hover:bg-opacity-80 transition-colors nav-dropdown-item"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="flex items-center w-full px-4 py-2 text-left hover:bg-opacity-80 transition-colors nav-dropdown-item"
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
              className="md:hidden p-2 sm:p-3 rounded-xl transition-all duration-300 glass-button"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden transition-all duration-300 animate-smooth-entrance glass-nav">
          <div className="px-4 pt-4 pb-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { 
                  onNavigate(item.id); 
                  setIsMenuOpen(false); 
                }}
                className={`block w-full text-left px-4 py-3 rounded-xl font-hind font-medium transition-all duration-300 nav-mobile-link ${
                  currentPage === item.id 
                    ? 'glass-button-primary text-white' 
                    : 'glass-button'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="pt-3 border-t border-gray-200/20 space-y-2">
              <div className="flex justify-center mb-3">
                <ThemeToggle />
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
                      className="flex items-center justify-center w-full px-4 py-2 rounded-xl text-sm font-medium transition-colors nav-mobile-dropdown"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        handleClick();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center justify-center w-full px-4 py-2 rounded-xl text-sm font-medium transition-colors nav-mobile-dropdown"
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