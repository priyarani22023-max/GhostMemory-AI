/**
 * CandleFlame: A delicate animated candlelight flame component
 */

import React from 'react';

interface CandleFlameProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CandleFlame: React.FC<CandleFlameProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-4 h-6',
    md: 'w-5 h-8',
    lg: 'w-7 h-11',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeMap[size]} ${className}`}>
      {/* Outer warm glow */}
      <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-md candle-glow-flame" />

      {/* Flame SVG */}
      <svg
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 candle-glow-flame"
      >
        {/* Outer amber petal */}
        <path
          d="M12 2C12 2 4 14 4 22C4 27.5228 7.58172 32 12 32C16.4183 32 20 27.5228 20 22C20 14 12 2 12 2Z"
          fill="url(#candleOuterGrad)"
        />
        {/* Inner bright yellow core */}
        <path
          d="M12 11C12 11 7 19 7 24C7 27.3137 9.23858 30 12 30C14.7614 30 17 27.3137 17 24C17 19 12 11 12 11Z"
          fill="url(#candleInnerGrad)"
        />
        {/* Blue base */}
        <ellipse cx="12" cy="27" rx="2.5" ry="3" fill="#3b82f6" opacity="0.6" />

        <defs>
          <linearGradient id="candleOuterGrad" x1="12" y1="2" x2="12" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f59e0b" />
            <stop offset="0.7" stopColor="#ea580c" />
            <stop offset="1" stopColor="#7c2d12" />
          </linearGradient>
          <linearGradient id="candleInnerGrad" x1="12" y1="11" x2="12" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fef08a" />
            <stop offset="0.6" stopColor="#fde047" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
