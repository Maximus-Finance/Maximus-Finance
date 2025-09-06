import { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface LiveDataIndicatorProps {
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
}

export default function LiveDataIndicator({ lastUpdated, isLoading, error }: LiveDataIndicatorProps) {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (!lastUpdated || isLoading) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
      const remaining = Math.max(15 - diffSeconds, 0);
      setCountdown(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated, isLoading]);

  const getStatusConfig = () => {
    if (error) return {
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      icon: AlertCircle,
      text: 'Connection Error'
    };
    
    if (isLoading) return {
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30', 
      textColor: 'text-yellow-400',
      icon: Activity,
      text: 'Fetching Live Data...'
    };
    
    return {
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
      icon: CheckCircle,
      text: 'Live Data Active'
    };
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else {
      return `${Math.floor(diffSeconds / 60)}m ago`;
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <div className={`
      inline-flex items-center gap-4 px-8 py-4 rounded-3xl transition-all duration-300 hover-light animate-smooth-entrance
      glass-3d-dark ${status.bgColor} ${status.borderColor}
    `}>
      {/* Status Section */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div 
            className={`w-3 h-3 rounded-full bg-gradient-to-r ${status.color} ${isLoading ? 'animate-ping' : 'animate-pulse'}`}
          />
          <div 
            className={`absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r ${status.color} opacity-75`}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <StatusIcon size={18} className={`${status.textColor} ${isLoading ? 'animate-spin' : 'animate-light-float'}`} />
          <span className={`font-bold text-base font-hind ${status.textColor}`}>
            {status.text}
          </span>
        </div>
      </div>

      {/* Countdown and Last Updated */}
      {!error && (
        <div className="flex items-center gap-4 text-xs">
          {!isLoading && countdown > 0 && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Clock size={14} className="animate-light-float" />
              <span className="font-hind font-medium">Next update: {countdown}s</span>
              <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-1000"
                  style={{ width: `${(countdown / 15) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {lastUpdated && (
            <span className="text-gray-500 dark:text-gray-400 animate-fade-in font-hind font-medium">
              Updated: {formatLastUpdated()}
            </span>
          )}
        </div>
      )}

      {/* Error Details */}
      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-xl border border-red-500/30 font-hind font-medium hover-light">
          {error}
        </div>
      )}

      {/* Animated pulse ring */}
      {!error && (
        <div className={`
          absolute -inset-2 rounded-3xl bg-gradient-to-r ${status.color} opacity-20 blur-sm
          ${isLoading ? 'animate-pulse' : 'animate-background-shift'}
        `} />
      )}
    </div>
  );
}