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
        return isDarkMode
          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg';
      case 'secondary':
        return isDarkMode 
          ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg' 
          : 'bg-gray-800 hover:bg-gray-900 text-white shadow-lg';
      case 'outline':
        return isDarkMode
          ? 'bg-transparent border-2 border-blue-500 hover:border-blue-400 text-blue-400 hover:text-blue-300'
          : 'bg-transparent border-2 border-gray-800 hover:border-gray-900 text-gray-800 hover:text-gray-900';
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