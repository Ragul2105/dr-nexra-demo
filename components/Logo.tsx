import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', animated = false }) => {
  let dim = 'w-16 h-16';
  if (size === 'sm') dim = 'w-8 h-8';
  if (size === 'lg') dim = 'w-24 h-24';
  if (size === 'xl') dim = 'w-32 h-32';

  return (
    <div className={`relative flex items-center justify-center ${dim} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          {/* Soft shadow for depth */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="1" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base: Thick Cross with Rounded Corners */}
        <g filter="url(#softShadow)">
          {/* Vertical Bar */}
          <rect x="22" y="0" width="56" height="100" rx="16" fill="url(#logoGradient)" />
          {/* Horizontal Bar */}
          <rect x="0" y="22" width="100" height="56" rx="16" fill="url(#logoGradient)" />
        </g>
        
        {/* Overlay: White Floral Pattern (X-Shape Petals) */}
        {/* If animated, we apply the class 'animate-spin-slow' which overrides the static transform */}
        <g 
            transform="translate(50, 50) rotate(45)" 
            className={animated ? "animate-spin-slow" : ""}
        >
            {/* Petal pointing Right (along rotated X) */}
            <path d="M 0 0 Q 17 -11 34 0 Q 17 11 0 0 Z" fill="white" />
            {/* Petal pointing Down (along rotated Y) */}
            <path d="M 0 0 Q -11 17 0 34 Q 11 17 0 0 Z" fill="white" />
            {/* Petal pointing Left */}
            <path d="M 0 0 Q -17 11 -34 0 Q -17 -11 0 0 Z" fill="white" />
            {/* Petal pointing Up */}
            <path d="M 0 0 Q 11 -17 0 -34 Q -11 -17 0 0 Z" fill="white" />
            
            {/* Small center circle to smooth the junction */}
            <circle cx="0" cy="0" r="4" fill="white" />
        </g>
      </svg>
    </div>
  );
};