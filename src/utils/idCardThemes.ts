import { IdCardTheme } from '../types';

export interface ThemeBadgeColor {
  bg: string;
  text: string;
  border?: string;
}

export interface IdCardThemeConfig {
  id: IdCardTheme;
  name: string;
  emoji: string;
  tagline: string;
  headerTitle: string;
  headerSlogan: string;
  accentColor: string; // e.g. #CCFF00
  accentText: string;  // e.g. text-black
  secondaryAccent: string; // e.g. #8B5CF6
  cardBg: string; // e.g. bg-[#F1F3F5] or bg-[#0A0D0B]
  isDark: boolean;
  borderClass: string;
  dividerColor: string;
  iconBoxBg: string;
  iconBoxColor: string;
  chipColors: ThemeBadgeColor[];
  defaultTags: string[];
  scanBoxText: string;
}

export const ID_CARD_THEMES: Record<IdCardTheme, IdCardThemeConfig> = {
  spidey: {
    id: 'spidey',
    name: 'Spidey',
    emoji: '🕷️',
    tagline: 'Spider Archives · Acid Lime & Webbed Motifs',
    headerTitle: 'ARCHIVES_',
    headerSlogan: 'EXPLORE / BUILD / GROW',
    accentColor: '#CCFF00',
    accentText: 'text-black',
    secondaryAccent: '#A78BFA',
    cardBg: 'bg-[#F3EFE6]',
    isDark: false,
    borderClass: 'border-black',
    dividerColor: 'border-black',
    iconBoxBg: 'bg-black',
    iconBoxColor: 'text-[#CCFF00]',
    chipColors: [
      { bg: 'bg-[#D8E2FE]', text: 'text-[#1E3A8A]' }, // Lavender blue for AI/ML
      { bg: 'bg-[#E9D5FF]', text: 'text-[#581C87]' }, // Lilac for Web Dev
      { bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]' }, // Mint green for IoT
      { bg: 'bg-[#FED7AA]', text: 'text-[#9A3412]' }, // Peach for Robotics
      { bg: 'bg-[#FECDD3]', text: 'text-[#9F1239]' }, // Coral pink for Python
      { bg: 'bg-[#CFFAFE]', text: 'text-[#155E75]' }, // Cyan blue for C++
      { bg: 'bg-[#F3E8FF]', text: 'text-[#6B21A8]' }, // Lavender violet for Electronics
      { bg: 'bg-[#DCFCE7]', text: 'text-[#166534]' }, // Sage green for UI/UX
    ],
    defaultTags: ['#Tech', '#Build', '#Explore', '#Student', '#Dreamer'],
    scanBoxText: 'SCAN TO CONNECT',
  },
  'iron-man': {
    id: 'iron-man',
    name: 'Iron Man',
    emoji: '🦾',
    tagline: 'Stark Industries · Arc Reactor & Crimson Gold',
    headerTitle: 'STARK_IND_',
    headerSlogan: 'JARVIS / PROTOCOL / MK-85',
    accentColor: '#DC2626',
    accentText: 'text-white',
    secondaryAccent: '#F59E0B',
    cardBg: 'bg-[#FEFCE8]',
    isDark: false,
    borderClass: 'border-black',
    dividerColor: 'border-black',
    iconBoxBg: 'bg-[#991B1B]',
    iconBoxColor: 'text-[#FDE047]',
    chipColors: [
      { bg: 'bg-[#DC2626]', text: 'text-white' },
      { bg: 'bg-[#F59E0B]', text: 'text-black' },
      { bg: 'bg-[#06B6D4]', text: 'text-black' },
      { bg: 'bg-[#FDE047]', text: 'text-black' },
      { bg: 'bg-[#B91C1C]', text: 'text-white' },
      { bg: 'bg-[#38BDF8]', text: 'text-black' },
      { bg: 'bg-[#E11D48]', text: 'text-white' },
      { bg: 'bg-[#FBBF24]', text: 'text-black' },
    ],
    defaultTags: ['#StarkTech', '#Avenger', '#ArcReactor', '#Genius', '#Engineer'],
    scanBoxText: 'JARVIS LINK',
  },
  barbie: {
    id: 'barbie',
    name: 'Barbie',
    emoji: '💖',
    tagline: 'Glam Dream · Hot Barbie Pink, Sparkles & Hearts',
    headerTitle: 'DREAM_ID_',
    headerSlogan: 'SPARKLE / GLAM / EMPOWER',
    accentColor: '#EC4899',
    accentText: 'text-white',
    secondaryAccent: '#F472B6',
    cardBg: 'bg-[#FFF1F2]',
    isDark: false,
    borderClass: 'border-black',
    dividerColor: 'border-black',
    iconBoxBg: 'bg-[#BE185D]',
    iconBoxColor: 'text-[#FDF2F8]',
    chipColors: [
      { bg: 'bg-[#F472B6]', text: 'text-black' },
      { bg: 'bg-[#FDE047]', text: 'text-black' },
      { bg: 'bg-[#FB7185]', text: 'text-white' },
      { bg: 'bg-[#C084FC]', text: 'text-black' },
      { bg: 'bg-[#F472B6]', text: 'text-black' },
      { bg: 'bg-[#FDE047]', text: 'text-black' },
      { bg: 'bg-[#FDA4AF]', text: 'text-black' },
      { bg: 'bg-[#A855F7]', text: 'text-white' },
    ],
    defaultTags: ['#GirlBoss', '#Iconic', '#DreamBig', '#GlamTech', '#Creative'],
    scanBoxText: 'CONNECT DREAM',
  },
  hacker: {
    id: 'hacker',
    name: 'Hacking Vibe',
    emoji: '💻',
    tagline: 'Matrix Root · Terminal Green & Cyber Streams',
    headerTitle: 'ROOT@ACCESS_',
    headerSlogan: 'DECRYPT / INJECT / OVERRIDE',
    accentColor: '#00FF66',
    accentText: 'text-black',
    secondaryAccent: '#10B981',
    cardBg: 'bg-[#0B0F0E]',
    isDark: true,
    borderClass: 'border-[#00FF66]',
    dividerColor: 'border-[#00FF66]/40',
    iconBoxBg: 'bg-[#00FF66]',
    iconBoxColor: 'text-black',
    chipColors: [
      { bg: 'bg-[#00FF66]', text: 'text-black' },
      { bg: 'bg-[#064E3B]', text: 'text-[#00FF66]' },
      { bg: 'bg-[#00FF66]', text: 'text-black' },
      { bg: 'bg-[#022C22]', text: 'text-[#34D399]' },
      { bg: 'bg-[#00FF66]', text: 'text-black' },
      { bg: 'bg-[#065F46]', text: 'text-[#6EE7B7]' },
      { bg: 'bg-[#00FF66]', text: 'text-black' },
      { bg: 'bg-[#047857]', text: 'text-white' },
    ],
    defaultTags: ['#CyberSec', '#Root', '#Exploit', '#0101', '#Terminal'],
    scanBoxText: 'EXECUTE LINK',
  },
  batman: {
    id: 'batman',
    name: 'Dark Knight',
    emoji: '🦇',
    tagline: 'Wayne Tech · Tactical Gotham & Bat Signal',
    headerTitle: 'WAYNE_CORP_',
    headerSlogan: 'JUSTICE / SHADOW / VIGIL',
    accentColor: '#EAB308',
    accentText: 'text-black',
    secondaryAccent: '#71717A',
    cardBg: 'bg-[#18181B]',
    isDark: true,
    borderClass: 'border-[#EAB308]',
    dividerColor: 'border-neutral-700',
    iconBoxBg: 'bg-[#EAB308]',
    iconBoxColor: 'text-black',
    chipColors: [
      { bg: 'bg-[#EAB308]', text: 'text-black' },
      { bg: 'bg-[#27272A]', text: 'text-[#EAB308]' },
      { bg: 'bg-[#FACC15]', text: 'text-black' },
      { bg: 'bg-[#3F3F46]', text: 'text-white' },
      { bg: 'bg-[#EAB308]', text: 'text-black' },
      { bg: 'bg-[#18181B]', text: 'text-[#FDE047]' },
      { bg: 'bg-[#CA8A04]', text: 'text-black' },
      { bg: 'bg-[#52525B]', text: 'text-white' },
    ],
    defaultTags: ['#WayneTech', '#Vigilante', '#Gotham', '#Tactical', '#Shadow'],
    scanBoxText: 'BAT-LINK ↗',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    emoji: '⚡',
    tagline: 'Night City · Neon Hazard Yellow & Magenta Glitch',
    headerTitle: 'NIGHT_CITY_',
    headerSlogan: 'NEURAL / CHROMED / HYPER',
    accentColor: '#FEE440',
    accentText: 'text-black',
    secondaryAccent: '#00F0FF',
    cardBg: 'bg-[#0F172A]',
    isDark: true,
    borderClass: 'border-[#FEE440]',
    dividerColor: 'border-[#00F0FF]/30',
    iconBoxBg: 'bg-[#FEE440]',
    iconBoxColor: 'text-black',
    chipColors: [
      { bg: 'bg-[#FEE440]', text: 'text-black' },
      { bg: 'bg-[#00F0FF]', text: 'text-black' },
      { bg: 'bg-[#FF007F]', text: 'text-white' },
      { bg: 'bg-[#FEE440]', text: 'text-black' },
      { bg: 'bg-[#00F0FF]', text: 'text-black' },
      { bg: 'bg-[#A855F7]', text: 'text-white' },
      { bg: 'bg-[#FF007F]', text: 'text-white' },
      { bg: 'bg-[#38BDF8]', text: 'text-black' },
    ],
    defaultTags: ['#Netrunner', '#Chromed', '#NightCity', '#Braindance', '#Glitch'],
    scanBoxText: 'JACK IN ↗',
  },
  'fire-pixel': {
    id: 'fire-pixel',
    name: 'Fire Pixel',
    emoji: '🔥',
    tagline: 'Firing Pixel Matrix · 8-Stop Dusk Palette & Retro Pixel Flame',
    headerTitle: 'PIXEL_CORE_',
    headerSlogan: 'IGNITE / OVERCLOCK / BLAZE',
    accentColor: '#f47b5c',
    accentText: 'text-[#1a1030]',
    secondaryAccent: '#f9c74f',
    cardBg: 'bg-[#150c28]',
    isDark: true,
    borderClass: 'border-[#f47b5c]',
    dividerColor: 'border-[#4b2f7e]',
    iconBoxBg: 'bg-[#f47b5c]',
    iconBoxColor: 'text-[#1a1030]',
    chipColors: [
      { bg: 'bg-[#f47b5c]', text: 'text-[#1a1030]' },
      { bg: 'bg-[#f9c74f]', text: 'text-[#1a1030]' },
      { bg: 'bg-[#241548]', text: 'text-[#f9c74f]' },
      { bg: 'bg-[#d34c53]', text: 'text-white' },
      { bg: 'bg-[#ff9844]', text: 'text-[#1a1030]' },
      { bg: 'bg-[#89325f]', text: 'text-white' },
      { bg: 'bg-[#f4e6c8]', text: 'text-[#1a1030]' },
      { bg: 'bg-[#3a1d5a]', text: 'text-[#fcc87e]' },
    ],
    defaultTags: ['#FirePixel', '#8BitFlame', '#Overclock', '#PixelForge', '#Terminal'],
    scanBoxText: 'BLAZE LINK ↗',
  },
};
