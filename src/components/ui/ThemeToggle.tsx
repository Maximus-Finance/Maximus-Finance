'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme, isLoading } = useTheme();

  if (isLoading) {
    return (
      <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center w-12 h-6 rounded-full transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 hover:scale-110 hover:shadow-lg"
      style={{
        backgroundColor: theme === 'dark' ? '#1e293b' : '#f59e0b',
        boxShadow: theme === 'dark'
          ? '0 0 20px rgba(59, 130, 246, 0.3), inset 0 1px 3px rgba(0, 0, 0, 0.3)'
          : '0 0 20px rgba(251, 191, 36, 0.4), inset 0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Toggle Background Overlay */}
      <div 
        className="absolute inset-0 rounded-full opacity-20"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(251, 191, 36, 0.3)'
        }}
      />
      
      {/* Moving Circle */}
      <div
        className="relative w-5 h-5 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-500 ease-in-out"
        style={{
          transform: theme === 'dark' ? 'translateX(2px)' : 'translateX(26px)',
          boxShadow: theme === 'dark'
            ? '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.2)'
            : '0 2px 8px rgba(0, 0, 0, 0.2), 0 0 15px rgba(251, 191, 36, 0.3)'
        }}
      >
        {/* Icon with smooth transition */}
        <div className="relative w-3 h-3 flex items-center justify-center">
          <Moon 
            size={12} 
            className={`absolute transition-all duration-300 ${
              theme === 'dark' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 -rotate-90 scale-75'
            }`}
            style={{ color: '#1e293b' }}
          />
          <Sun 
            size={12} 
            className={`absolute transition-all duration-300 ${
              theme === 'light' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 rotate-90 scale-75'
            }`}
            style={{ color: '#f59e0b' }}
          />
        </div>
      </div>

      {/* Animated stars for dark mode */}
      {theme === 'dark' && (
        <>
          <div 
            className="absolute w-1 h-1 bg-blue-200 rounded-full animate-pulse"
            style={{
              top: '4px',
              right: '8px',
              animationDelay: '0s',
              animationDuration: '2s'
            }}
          />
          <div 
            className="absolute w-0.5 h-0.5 bg-blue-300 rounded-full animate-pulse"
            style={{
              top: '14px',
              right: '12px',
              animationDelay: '1s',
              animationDuration: '1.5s'
            }}
          />
          <div 
            className="absolute w-0.5 h-0.5 bg-blue-200 rounded-full animate-pulse"
            style={{
              top: '8px',
              right: '16px',
              animationDelay: '0.5s',
              animationDuration: '2.5s'
            }}
          />
        </>
      )}

      {/* Animated rays for light mode */}
      {theme === 'light' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-1 bg-yellow-200 rounded-full opacity-60"
              style={{
                transform: `rotate(${i * 45}deg) translateY(-8px)`,
                transformOrigin: '50% 8px',
                animation: 'pulse 2s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
}
