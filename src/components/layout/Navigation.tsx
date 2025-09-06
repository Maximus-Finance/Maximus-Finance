'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
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
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 asgard-card border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo onNavigate={onNavigate} />
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-instrument-sans font-medium ${
                  currentPage === item.id
                    ? 'asgard-button-primary' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700 bg-transparent'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block relative" ref={dropdownRef}>
              <Button onClick={handleWalletButtonClick}>{buttonText}</Button>
              {isConnected && isWalletDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 asgard-card">
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-4 py-2 text-left hover:bg-opacity-80 transition-colors text-gray-300 hover:bg-gray-700"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="flex items-center w-full px-4 py-2 text-left hover:bg-opacity-80 transition-colors text-gray-300 hover:bg-gray-700"
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
              className="md:hidden p-2 sm:p-3 rounded-2xl transition-all duration-300 hover-light glass-3d-dark"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden transition-all duration-300 animate-smooth-entrance glass-3d-dark">
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
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="pt-3 border-t border-gray-200/20 space-y-2">
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
                      className="flex items-center justify-center w-full px-4 py-2 rounded-xl text-sm font-medium transition-colors text-gray-300 hover:bg-gray-700"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        handleClick();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center justify-center w-full px-4 py-2 rounded-xl text-sm font-medium transition-colors text-gray-300 hover:bg-gray-700"
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