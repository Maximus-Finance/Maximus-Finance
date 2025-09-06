'use client';

import React from 'react';

interface DataQualityIndicatorProps {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  systemHealth: number;
  alerts: string[];
}

const DataQualityIndicator: React.FC<DataQualityIndicatorProps> = ({ 
  quality, 
  systemHealth, 
  alerts
}) => {
  const getQualityConfig = () => {
    switch (quality) {
      case 'excellent':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          icon: '🟢',
          label: 'Excellent',
          description: 'All data sources validated and consistent'
        };
      case 'good':
        return {
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/20', 
          borderColor: 'border-blue-500/30',
          icon: '🔵',
          label: 'Good',
          description: 'Data cross-referenced from multiple sources'
        };
      case 'fair':
        return {
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30', 
          icon: '🟡',
          label: 'Fair',
          description: 'Some data inconsistencies detected'
        };
      case 'poor':
        return {
          color: 'text-red-500',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          icon: '🔴',
          label: 'Poor',
          description: 'Limited data sources - verify independently'
        };
    }
  };

  const config = getQualityConfig();

  return (
    <div className={`inline-flex items-center space-x-3 px-4 py-2 rounded-xl border font-hind glass-3d-dark ${config.bgColor} ${config.borderColor} hover-light animate-light-float`}>
      
      {/* Quality Indicator */}
      <div className="flex items-center space-x-2">
        <span className="text-lg">{config.icon}</span>
        <div>
          <span className={`font-semibold text-sm ${config.color}`}>
            {config.label} Data Quality
          </span>
          <div className="text-xs text-gray-400">
            {config.description}
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div className="flex items-center space-x-2">
        <div className="w-12 h-2 rounded-full overflow-hidden bg-gray-700">
          <div 
            className={`h-full transition-all duration-500 ${
              systemHealth >= 80 ? 'bg-green-500' :
              systemHealth >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${systemHealth}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-300">
          {systemHealth.toFixed(0)}%
        </span>
      </div>

      {/* Alerts Indicator */}
      {alerts.length > 0 && (
        <div className="relative group">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            alerts.length > 2 ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 bg-gray-800 text-gray-200 border border-gray-700 shadow-lg">
            <div className="font-semibold mb-1">Data Alerts ({alerts.length})</div>
            {alerts.slice(0, 3).map((alert, idx) => (
              <div key={idx} className="text-xs opacity-80">
                {alert.length > 40 ? `${alert.substring(0, 37)}...` : alert}
              </div>
            ))}
            {alerts.length > 3 && (
              <div className="text-xs opacity-60 mt-1">
                +{alerts.length - 3} more alerts
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataQualityIndicator;