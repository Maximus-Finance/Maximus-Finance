'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import { NavigationProps } from '@/types';
import { useWalletConnect } from '@/hooks/useWalletConnect';

const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { buttonText, handleClick } = useWalletConnect();

  const navItems = [
    { id: 'home' as const, label: 'Home' },
    { id: 'yields' as const, label: 'Yields' },
    { id: 'protocols' as const, label: 'Strategies' },
    { id: 'dashboard' as const, label: 'Dashboard' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group">
          <Image
            src="/logo.png"
            alt="Maximus Finance Logo"
            width={32}
            height={32}
            className="object-contain group-hover:scale-110 transition-transform duration-300"
          />
            <span className="font-bold text-lg text-foreground hidden sm:inline">
              Maximus Finance
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`transition-colors duration-300 ${
                  currentPage === item.id
                    ? 'text-primary font-semibold'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleClick}
              className="hidden sm:block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover-lift"
            >
              {buttonText}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors duration-300"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;