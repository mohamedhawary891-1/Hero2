import React from 'react';

interface HawariLogoProps {
  variant?: 'full' | 'horizontal' | 'emblem' | 'dark_badge' | 'badge';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const HawariLogo: React.FC<HawariLogoProps> = ({ 
  variant = 'horizontal', 
  className = '',
  size = 'md'
}) => {
  const sizeMap = {
    sm: { w: 'w-8 h-8', badgeW: 'w-24', text: 'text-base', sub: 'text-[9px]' },
    md: { w: 'w-12 h-12', badgeW: 'w-36', text: 'text-lg', sub: 'text-[10px]' },
    lg: { w: 'w-16 h-16', badgeW: 'w-48', text: 'text-2xl', sub: 'text-xs' },
    xl: { w: 'w-24 h-24', badgeW: 'w-64', text: 'text-3xl', sub: 'text-sm' },
  };

  // Accurate SVG of the uploaded Hawari Store official emblem
  const HawariOfficialSVG = (
    <svg 
      viewBox="0 0 200 200" 
      className={`${sizeMap[size].w} drop-shadow-md shrink-0`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hwOrangeMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffb347" />
          <stop offset="30%" stopColor="#ff7a00" />
          <stop offset="70%" stopColor="#d35400" />
          <stop offset="100%" stopColor="#a04000" />
        </linearGradient>
        <linearGradient id="hwGoldGlow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff9800" />
          <stop offset="50%" stopColor="#ffc107" />
          <stop offset="100%" stopColor="#e65100" />
        </linearGradient>
        <filter id="hwDropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1.5" dy="3" stdDeviation="2" floodColor="#4a1500" floodOpacity="0.7"/>
        </filter>
      </defs>

      {/* Circular Orbit Ring with gap */}
      <circle 
        cx="92" 
        cy="92" 
        r="75" 
        stroke="url(#hwOrangeMetallic)" 
        strokeWidth="11" 
        strokeLinecap="round"
        strokeDasharray="420 80"
        strokeDashoffset="25"
      />

      {/* Big 3D Stylized 'H' */}
      <g filter="url(#hwDropShadow)">
        {/* Left Vertical of H */}
        <path 
          d="M 64 48 L 84 48 L 84 136 L 64 136 Z" 
          fill="url(#hwGoldGlow)" 
        />
        {/* Horizontal bar of H */}
        <path 
          d="M 80 82 L 126 82 L 126 100 L 80 100 Z" 
          fill="url(#hwOrangeMetallic)" 
        />
        {/* Right Vertical of H */}
        <path 
          d="M 106 48 L 126 48 L 126 136 L 106 136 Z" 
          fill="url(#hwGoldGlow)" 
        />

        {/* Dynamic Curved Swoop cutting across */}
        <path 
          d="M 52 138 Q 85 102 144 94 Q 92 118 64 156 Z" 
          fill="url(#hwOrangeMetallic)" 
        />

        {/* Attached Shopping Cart */}
        <path 
          d="M 126 72 L 164 72 L 150 114 L 104 114" 
          stroke="url(#hwOrangeMetallic)" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Cart inner lines */}
        <line x1="120" y1="86" x2="152" y2="86" stroke="url(#hwGoldGlow)" strokeWidth="5" strokeLinecap="round" />
        <line x1="116" y1="98" x2="144" y2="98" stroke="url(#hwGoldGlow)" strokeWidth="5" strokeLinecap="round" />

        {/* Cart Wheels */}
        <circle cx="110" cy="130" r="9" fill="url(#hwOrangeMetallic)" />
        <circle cx="140" cy="130" r="9" fill="url(#hwOrangeMetallic)" />
        <circle cx="110" cy="130" r="4" fill="#fff" opacity="0.3" />
        <circle cx="140" cy="130" r="4" fill="#fff" opacity="0.3" />
      </g>
    </svg>
  );

  if (variant === 'emblem') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{HawariOfficialSVG}</div>;
  }

  // Full Luxury Dark Badge (Exact match to the provided image)
  if (variant === 'dark_badge' || variant === 'full') {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-slate-950 border border-orange-500/30 rounded-3xl text-center shadow-2xl relative overflow-hidden group select-none ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-orange-950/20 via-transparent to-black/60 pointer-events-none" />
        
        {/* Emblem */}
        <div className="relative z-10">{HawariOfficialSVG}</div>
        
        {/* Typography: HAWARI STORE */}
        <div className="relative z-10 mt-2 font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 text-xl uppercase font-sans">
          HAWARI
        </div>
        <div className="relative z-10 text-[11px] tracking-[0.3em] text-slate-300 font-bold -mt-0.5 uppercase">
          — STORE —
        </div>

        {/* Slogan & Padlock */}
        <div className="relative z-10 mt-2 flex items-center justify-center gap-1 text-[9px] font-bold text-amber-400/90 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span>QUALITY YOU DESERVE</span>
        </div>
      </div>
    );
  }

  // Horizontal Header Variant (Clean, High Contrast, Responsive)
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {HawariOfficialSVG}
      <div className="flex flex-col text-right">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">
            هواري <span className="text-orange-600">ستور</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-orange-600 font-mono" dir="ltr">
            HAWARI STORE
          </span>
          <span className="text-[9px] text-slate-400 font-semibold hidden sm:inline">• QUALITY YOU DESERVE</span>
        </div>
      </div>
    </div>
  );
};
