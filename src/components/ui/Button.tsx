'use client';

import { ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}) => {
  const { isDarkMode } = useTheme();
  
  const baseClasses = 'font-hind font-semibold transition-all duration-500 hover-3d focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed animate-bubble';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-600 text-white shadow-2xl animate-glow';
      case 'secondary':
        return isDarkMode 
          ? 'glass-3d-dark text-white hover:text-gray-100' 
          : 'glass-3d text-gray-700 hover:text-gray-900';
      case 'outline':
        return isDarkMode
          ? 'glass-3d-dark text-gray-300 hover:text-white border-2 border-purple-500/50 hover:border-purple-400'
          : 'glass-3d text-gray-700 hover:text-gray-900 border-2 border-blue-500/50 hover:border-blue-400';
      default:
        return '';
    }
  };
  
  const sizeClasses = {
    sm: 'px-5 py-3 text-sm rounded-xl',
    md: 'px-8 py-4 text-base rounded-2xl',
    lg: 'px-10 py-5 text-lg rounded-2xl',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${getVariantClasses()} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;