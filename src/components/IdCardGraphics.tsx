import React from 'react';
import { IdCardTheme } from '../types';

export const GlobeWireframeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

export const CrawlingSpider: React.FC<{ className?: string; color?: string }> = ({ className = 'w-6 h-6', color = 'currentColor' }) => (
  <svg viewBox="0 0 100 100" fill={color} className={className}>
    {/* Silk thread up */}
    <line x1="50" y1="0" x2="50" y2="40" stroke={color} strokeWidth="3" />
    {/* Spider Body - Cephalothorax & Abdomen */}
    <ellipse cx="50" cy="46" rx="9" ry="8" />
    <ellipse cx="50" cy="62" rx="14" ry="16" />
    
    {/* Left Legs */}
    {/* Leg 1 */}
    <path d="M44 44 Q 28 30 18 36" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    {/* Leg 2 */}
    <path d="M42 47 Q 22 42 14 52" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    {/* Leg 3 */}
    <path d="M42 52 Q 20 60 16 72" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    {/* Leg 4 */}
    <path d="M44 56 Q 26 78 22 88" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />

    {/* Right Legs */}
    {/* Leg 1 */}
    <path d="M56 44 Q 72 30 82 36" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    {/* Leg 2 */}
    <path d="M58 47 Q 78 42 86 52" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    {/* Leg 3 */}
    <path d="M58 52 Q 80 60 84 72" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    {/* Leg 4 */}
    <path d="M56 56 Q 74 78 78 88" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const SpiderWebGraphic: React.FC<{ className?: string; color?: string }> = ({ className = 'w-48 h-32', color = 'currentColor' }) => (
  <svg viewBox="0 0 200 140" fill="none" stroke={color} strokeWidth="1.8" className={className}>
    {/* Radiating lines originating from top center */}
    <line x1="130" y1="0" x2="30" y2="120" />
    <line x1="130" y1="0" x2="60" y2="135" />
    <line x1="130" y1="0" x2="95" y2="140" />
    <line x1="130" y1="0" x2="130" y2="140" />
    <line x1="130" y1="0" x2="165" y2="135" />
    <line x1="130" y1="0" x2="195" y2="115" />
    <line x1="130" y1="0" x2="200" y2="80" />
    <line x1="130" y1="0" x2="200" y2="40" />

    {/* Concentric curved connecting threads */}
    {/* Arc 1 */}
    <path d="M100 25 Q 115 32 130 32 Q 145 32 155 25 Q 165 20 170 12" />
    {/* Arc 2 */}
    <path d="M75 52 Q 95 62 130 62 Q 160 62 175 48 Q 185 38 190 26" />
    {/* Arc 3 */}
    <path d="M52 82 Q 85 96 130 96 Q 170 96 188 74 Q 196 60 198 46" />
    {/* Arc 4 */}
    <path d="M34 114 Q 75 132 130 132 Q 178 132 195 106 Q 200 90 200 75" />
  </svg>
);

export const QrCodeGraphic: React.FC<{ accentColor?: string; className?: string }> = ({
  accentColor = '#CCFF00',
  className = 'w-20 h-20',
}) => {
  return (
    <div className={`relative p-1 bg-white border-2 border-black flex items-center justify-center shrink-0 ${className}`}>
      {/* Sci-Fi Corner Brackets */}
      <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: accentColor }} />
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: accentColor }} />
      <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: accentColor }} />
      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: accentColor }} />

      {/* SVG Vector QR Code Pattern with Zero-Blur Crisp Edges */}
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="black" shapeRendering="crispEdges">
        {/* Top-Left Finder */}
        <rect x="5" y="5" width="28" height="28" fill="black" />
        <rect x="9" y="9" width="20" height="20" fill="white" />
        <rect x="13" y="13" width="12" height="12" fill="black" />

        {/* Top-Right Finder */}
        <rect x="67" y="5" width="28" height="28" fill="black" />
        <rect x="71" y="9" width="20" height="20" fill="white" />
        <rect x="75" y="13" width="12" height="12" fill="black" />

        {/* Bottom-Left Finder */}
        <rect x="5" y="67" width="28" height="28" fill="black" />
        <rect x="9" y="71" width="20" height="20" fill="white" />
        <rect x="13" y="75" width="12" height="12" fill="black" />

        {/* Dense stylized data dots */}
        <rect x="40" y="8" width="8" height="8" />
        <rect x="52" y="8" width="6" height="6" />
        <rect x="42" y="20" width="12" height="6" />
        <rect x="40" y="32" width="6" height="8" />
        <rect x="52" y="32" width="8" height="8" />
        <rect x="10" y="40" width="8" height="6" />
        <rect x="24" y="42" width="8" height="8" />
        <rect x="36" y="46" width="6" height="6" />
        <rect x="48" y="44" width="8" height="8" />
        <rect x="60" y="40" width="8" height="6" />
        <rect x="74" y="42" width="8" height="8" />
        <rect x="88" y="40" width="6" height="8" />
        <rect x="10" y="54" width="6" height="6" />
        <rect x="22" y="54" width="8" height="6" />
        <rect x="38" y="58" width="6" height="8" />
        <rect x="50" y="56" width="8" height="6" />
        <rect x="64" y="54" width="12" height="6" />
        <rect x="82" y="56" width="10" height="6" />
        <rect x="40" y="72" width="8" height="6" />
        <rect x="54" y="70" width="6" height="8" />
        <rect x="66" y="72" width="8" height="6" />
        <rect x="80" y="74" width="12" height="6" />
        <rect x="42" y="84" width="8" height="8" />
        <rect x="56" y="84" width="10" height="8" />
        <rect x="72" y="86" width="6" height="8" />
        <rect x="84" y="84" width="10" height="10" />
      </svg>
    </div>
  );
};

export const VectorSmartChip: React.FC<{ className?: string }> = ({ className = 'w-10 h-8' }) => (
  <div className={`relative bg-gradient-to-br from-[#EAB308] via-[#FACC15] to-[#CA8A04] border-2 border-black rounded-[4px] p-0.5 shadow-[1.5px_1.5px_0px_#000] overflow-hidden ${className}`}>
    <svg viewBox="0 0 40 32" className="w-full h-full" fill="none" stroke="#78350F" strokeWidth="1.2">
      <rect x="2" y="2" width="36" height="28" rx="2" stroke="#000" strokeWidth="1.5" />
      <path d="M2 11h14c2 0 4 2 4 5s-2 5-4 5H2" />
      <path d="M38 11H24c-2 0-4 2-4 5s2 5 4 5h14" />
      <path d="M20 2v9m0 10v9" />
      <circle cx="20" cy="16" r="3.5" fill="#FEF08A" stroke="#000" strokeWidth="1.2" />
    </svg>
  </div>
);

export const ArcReactorGraphic: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-40 h-32',
  color = '#00F0FF',
}) => (
  <svg viewBox="0 0 200 140" fill="none" stroke={color} strokeWidth="1.5" className={className}>
    {/* Concentric HUD rings */}
    <circle cx="140" cy="50" r="42" strokeDasharray="6 3" />
    <circle cx="140" cy="50" r="32" strokeWidth="2" />
    <circle cx="140" cy="50" r="22" strokeDasharray="3 3" />
    <circle cx="140" cy="50" r="12" fill={color} fillOpacity="0.2" strokeWidth="2" />
    {/* Radial crosshairs */}
    <line x1="85" y1="50" x2="195" y2="50" strokeDasharray="4 2" />
    <line x1="140" y1="0" x2="140" y2="110" strokeDasharray="4 2" />
    {/* Target indicators */}
    <path d="M125 15 L 140 8 L 155 15" />
    <path d="M125 85 L 140 92 L 155 85" />
    <text x="75" y="115" fill={color} fontSize="9" fontFamily="monospace" fontWeight="bold">
      MARK-85 HUD // 100% ONLINE
    </text>
  </svg>
);

export const BarbieSparkleGraphic: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-40 h-32',
  color = '#EC4899',
}) => (
  <svg viewBox="0 0 200 140" fill={color} className={className}>
    {/* Large Sparkle 1 */}
    <path d="M140 10 Q 140 30 160 30 Q 140 30 140 50 Q 140 30 120 30 Q 140 30 140 10 Z" />
    {/* Medium Sparkle 2 */}
    <path d="M90 35 Q 90 48 103 48 Q 90 48 90 61 Q 90 48 77 48 Q 90 48 90 35 Z" opacity="0.85" />
    {/* Small Sparkle 3 */}
    <path d="M165 65 Q 165 73 173 73 Q 165 73 165 81 Q 165 73 157 73 Q 165 73 165 65 Z" opacity="0.9" />
    {/* Tiny Sparkles */}
    <circle cx="115" cy="20" r="2.5" />
    <circle cx="175" cy="25" r="2" />
    <circle cx="70" cy="65" r="2" />
    {/* Floating Chic Heart */}
    <path
      d="M130 85 C 130 80, 120 74, 112 82 C 104 74, 94 80, 94 85 C 94 95, 112 108, 112 108 C 112 108, 130 95, 130 85 Z"
      fill={color}
      opacity="0.8"
    />
  </svg>
);

export const MatrixRainGraphic: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-40 h-32',
  color = '#00FF66',
}) => (
  <div className={`overflow-hidden font-mono text-[9px] leading-tight select-none opacity-85 ${className}`} style={{ color }}>
    <div>01001001 01010100 00100000</div>
    <div>10110001 ROOT_ACCESS_GRANTED</div>
    <div>01100110 [SYSTEM_OVERRIDE]</div>
    <div>11001010 01100001 01110011</div>
    <div>00110001 00110111 00101110</div>
    <div>&gt;&gt; IP: 192.168.0.1_AUTH</div>
  </div>
);

export const BatSignalGraphic: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-40 h-32',
  color = '#EAB308',
}) => (
  <svg viewBox="0 0 200 140" fill={color} className={className}>
    {/* Sonar Radar Rings */}
    <circle cx="140" cy="50" r="44" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
    <circle cx="140" cy="50" r="30" fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
    {/* Stylized Bat Wings Insignia */}
    <path
      d="M140 38 Q 146 48 158 44 Q 155 56 166 60 Q 150 64 140 76 Q 130 64 114 60 Q 125 56 122 44 Q 134 48 140 38 Z"
      fill={color}
    />
    <text x="90" y="98" fill={color} fontSize="8" fontFamily="monospace" fontWeight="bold">
      WAYNE_SECURITY // GOTHAM_TACTICAL
    </text>
  </svg>
);

export const FirePixelGraphic: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-48 h-32',
}) => (
  <div className={`flex flex-col items-end justify-center select-none font-mono ${className}`}>
    <div className="flex items-center gap-1.5 px-2 py-0.5 border-2 border-[#f4e6c8] bg-[#1a1030] shadow-[2px_2px_0_#060410]">
      <span className="w-2 h-2 bg-[#f47b5c] animate-pulse" />
      <span className="text-[10px] font-bold text-[#f9c74f] uppercase tracking-wider font-mono">
        PIXEL_CORE // 60FPS
      </span>
    </div>
    {/* 8-bit retro pixel flame SVG */}
    <svg viewBox="0 0 160 80" className="w-36 h-18 mt-1" shapeRendering="crispEdges">
      {/* Outer Crimson Base Layer */}
      <rect x="70" y="55" width="20" height="20" fill="#d34c53" />
      <rect x="55" y="60" width="15" height="15" fill="#89325f" />
      <rect x="90" y="60" width="15" height="15" fill="#89325f" />
      <rect x="40" y="65" width="15" height="10" fill="#4b2f7e" />
      <rect x="105" y="65" width="15" height="10" fill="#4b2f7e" />

      {/* Mid Flame Coral Layer */}
      <rect x="65" y="40" width="30" height="20" fill="#f47b5c" />
      <rect x="50" y="45" width="15" height="20" fill="#f47b5c" />
      <rect x="95" y="45" width="15" height="20" fill="#f47b5c" />
      <rect x="75" y="25" width="15" height="20" fill="#f47b5c" />
      <rect x="60" y="30" width="10" height="15" fill="#f47b5c" />

      {/* Inner Hot Gold Flame Core */}
      <rect x="70" y="35" width="18" height="25" fill="#f9c74f" />
      <rect x="65" y="50" width="28" height="18" fill="#f9c74f" />
      <rect x="75" y="20" width="10" height="15" fill="#f9c74f" />

      {/* White Hot Ignition Center */}
      <rect x="75" y="45" width="10" height="15" fill="#ffffff" />
      <rect x="78" y="38" width="6" height="8" fill="#ffffff" />

      {/* Floating Pixel Embers drifting upward */}
      <rect x="85" y="10" width="4" height="4" fill="#f9c74f" />
      <rect x="60" y="15" width="4" height="4" fill="#f47b5c" />
      <rect x="100" y="25" width="4" height="4" fill="#ff9844" />
      <rect x="50" y="30" width="4" height="4" fill="#f4e6c8" />
      <rect x="72" y="5" width="4" height="4" fill="#ffffff" />
    </svg>
  </div>
);

export const ThemeHeaderGraphic: React.FC<{ theme: IdCardTheme; color?: string }> = ({ theme, color }) => {
  switch (theme) {
    case 'spidey':
      return <SpiderWebGraphic className="w-44 h-28 sm:w-56 sm:h-32" color={color || '#000'} />;
    case 'iron-man':
      return <ArcReactorGraphic className="w-44 h-28 sm:w-52 sm:h-32" color={color || '#DC2626'} />;
    case 'barbie':
      return <BarbieSparkleGraphic className="w-44 h-28 sm:w-52 sm:h-32" color={color || '#EC4899'} />;
    case 'hacker':
      return <MatrixRainGraphic className="w-44 h-28 sm:w-52 sm:h-32" color={color || '#00FF66'} />;
    case 'batman':
      return <BatSignalGraphic className="w-44 h-28 sm:w-52 sm:h-32" color={color || '#EAB308'} />;
    case 'cyberpunk':
      return (
        <div className="w-44 h-28 sm:w-52 sm:h-32 flex flex-col justify-center items-end pr-2 text-right">
          <div className="text-[10px] font-mono font-black text-[#FEE440] bg-black px-1.5 py-0.5 border border-[#FEE440]">
            CYBER_NET // 2077
          </div>
          <div className="text-[8px] font-mono text-[#00F0FF] mt-1 font-bold">
            NEURAL_LINK : ACTIVE
          </div>
          <div className="flex gap-1 mt-1">
            <span className="w-3 h-1 bg-[#FF007F]"></span>
            <span className="w-5 h-1 bg-[#FEE440]"></span>
            <span className="w-2 h-1 bg-[#00F0FF]"></span>
          </div>
        </div>
      );
    case 'fire-pixel':
      return <FirePixelGraphic className="w-44 h-28 sm:w-52 sm:h-32" color={color || '#f47b5c'} />;
    default:
      return <SpiderWebGraphic className="w-44 h-28 sm:w-56 sm:h-32" color={color || '#000'} />;
  }
};
