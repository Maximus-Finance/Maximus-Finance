'use client';

import { ReactNode } from 'react';

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
  
  const baseClasses = 'font-instrument-sans font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'asgard-button-primary';
      case 'secondary':
        return 'asgard-button';
      case 'outline':
        return 'bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white hover:bg-gray-800/50';
      default:
        return '';
    }
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
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