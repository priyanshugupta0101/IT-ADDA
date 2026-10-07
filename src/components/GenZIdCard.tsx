import React, { useState } from 'react';
import { StudentProfile, IdCardTheme } from '../types';
import { useApp } from '../context/AppContext';
import { ID_CARD_THEMES } from '../utils/idCardThemes';
import { InteractiveReactionPill } from './InteractiveReactionPill';
import {
  GlobeWireframeIcon,
  CrawlingSpider,
  QrCodeGraphic,
  ThemeHeaderGraphic,
  VectorSmartChip,
} from './IdCardGraphics';
import {
  User,
  GraduationCap,
  Calendar,
  CreditCard,
  Users,
  FileText,
  Instagram,
  Tag,
  ArrowUpRight,
  Sparkles,
  Edit3,
  Check,
  Share2,
} from 'lucide-react';

interface GenZIdCardProps {
  student: StudentProfile;
  isOwnProfile?: boolean;
  onOpenPersonalDetails?: () => void;
  showLikeShortcut?: boolean;
  selectedTheme?: IdCardTheme;
  onThemeChange?: (theme: IdCardTheme) => void;
  showThemeBar?: boolean;
}

export const GenZIdCard: React.FC<GenZIdCardProps> = ({
  student,
  isOwnProfile = false,
  onOpenPersonalDetails,
  showLikeShortcut = false,
  selectedTheme,
  onThemeChange,
  showThemeBar = false,
}) => {
  const { currentUser, updateStudentProfile } = useApp();

  const initialTheme: IdCardTheme =
    selectedTheme ||
    student.idCardTheme ||
    (student.gender === 'Girls' ? 'barbie' : 'spidey');

  const [currentThemeKey, setCurrentThemeKey] = useState<IdCardTheme>(initialTheme);
  const [showFullBio, setShowFullBio] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync if selectedTheme prop changes
  const activeThemeKey = selectedTheme || currentThemeKey;
  const themeConfig = ID_CARD_THEMES[activeThemeKey] || ID_CARD_THEMES.spidey;

  const handleSelectTheme = (themeKey: IdCardTheme) => {
    setCurrentThemeKey(themeKey);
    if (onThemeChange) {
      onThemeChange(themeKey);
    }
  };

  const handleSaveAsDefaultTheme = () => {
    if (currentUser) {
      updateStudentProfile(currentUser.id, { idCardTheme: activeThemeKey });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `Check out ${student.name}'s Engineering ID Card on IT Adda: Roll #${student.rollNumber} (${student.division})`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Formatted Roll Number: Simple clean representation like 01, 02, 23 (no code prefix)
  const rollNum = Number(student.rollNumber) || 0;
  const formattedRoll = rollNum < 10 ? `0${rollNum}` : String(rollNum);

  // High-Resolution Photo (upgrades quality for ultra-sharp zoom)
  const highResPhotoUrl = student.photoUrl
    ? student.photoUrl.replace(/w=\d+/, 'w=1000').replace(/q=\d+/, 'q=95')
    : '';

  // Process tech chips: Display exactly what the user entered, even if only 1 item like 'Python'
  const customInterests = student.techInterest
    ? student.techInterest
        .split(/[,;\n]+/)
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const displayInterests = customInterests;

  // Process tags
  const tagsList = student.profileTag && student.profileTag.trim()
    ? [`#${student.profileTag.trim().replace(/^#+/, '').replace(/\s+/g, '')}`]
    : themeConfig.defaultTags.slice(0, 3);

  return (
    <div className="flex flex-col items-center select-none font-mono">
      {/* Optional In-Card Theme Switcher Bar (when rendered standalone) */}
      {showThemeBar && (
        <div className="w-[960px] mb-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Smart Card Style:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {(Object.keys(ID_CARD_THEMES) as IdCardTheme[]).map((tKey) => {
              const t = ID_CARD_THEMES[tKey];
              const isSelected = activeThemeKey === tKey;
              return (
                <button
                  key={tKey}
                  onClick={() => handleSelectTheme(tKey)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={t.tagline}
                >
                  <span>{t.emoji}</span>
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>

          {isOwnProfile && (
            <button
              onClick={handleSaveAsDefaultTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                savedFeedback
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-indigo-600 text-white'
              }`}
            >
              {savedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Set Default</span>
              )}
            </button>
          )}
        </div>
      )}

      {/* 
        ========================================================================
        PURE LANDSCAPE CANVAS (960px x 570px)
        Strictly immutable 3-column landscape architecture matching uploaded photo
        ========================================================================
      */}
      <div
        style={{
          textRendering: 'geometricPrecision',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
        className={`w-[960px] h-[570px] rounded-3xl border border-slate-700/60 shadow-2xl shadow-slate-950/40 ${themeConfig.cardBg} ${
          themeConfig.isDark ? 'text-white' : 'text-slate-900'
        } flex flex-col justify-between overflow-hidden relative transition-colors duration-200 shrink-0 select-text`}
      >
        {/* ==================== 1. TOP HEADER STRIP (h-[58px]) ==================== */}
        <div className="h-[58px] border-b-[3px] border-black flex items-stretch justify-between relative bg-inherit shrink-0">
          {/* Top-Left: Lime/Theme Square with Wireframe Globe */}
          <div className="flex items-center">
            <div
              className="w-[58px] h-full border-r-[3px] border-black flex items-center justify-center shrink-0"
              style={{ backgroundColor: themeConfig.accentColor }}
            >
              <div className="text-black">
                <GlobeWireframeIcon className="w-8 h-8" />
              </div>
            </div>

            {/* Title: Monospace ARCHIVES_ / STARK_IND_ / DREAM_ID_ */}
            <div className="pl-4 py-1.5 flex items-center">
              <h1 className="text-3xl font-black tracking-tight uppercase font-mono leading-none">
                {themeConfig.headerTitle}
              </h1>
            </div>
          </div>

          {/* Center Graphic: Spider Web (for Spidey) or Theme HUD / Sparkle */}
          <div className="absolute right-60 top-0 bottom-0 pointer-events-none flex items-center justify-center opacity-90 overflow-hidden">
            <ThemeHeaderGraphic theme={activeThemeKey} color={themeConfig.isDark ? themeConfig.accentColor : '#000'} />
          </div>

          {/* Top-Right: Black Box with White Slogan + Accent Square with Arrow */}
          <div className="flex items-stretch border-l-[3px] border-black shrink-0 z-10">
            <div className="flex items-center px-4 bg-black text-white text-xs font-black tracking-widest uppercase">
              {themeConfig.headerSlogan}
            </div>

            <div
              className="w-[54px] h-full border-l-[3px] border-black flex items-center justify-center shrink-0 cursor-pointer"
              style={{ backgroundColor: themeConfig.accentColor }}
              title="Official Engineering Identification"
            >
              <ArrowUpRight className="w-7 h-7 text-black stroke-[3]" />
            </div>
          </div>
        </div>

        {/* ==================== 2. MAIN 3-COLUMN CONTENT BODY (h-[480px]) ==================== */}
        <div className="h-[480px] grid grid-cols-12 divide-x-[3px] divide-black overflow-hidden shrink-0">
          {/* 
            --------------------------------------------------------------------
            COLUMN 1 (col-span-4, width ~320px): Photo, Scan-To-Connect & QR Code
            --------------------------------------------------------------------
          */}
          <div className="col-span-4 p-3.5 flex flex-col justify-between h-full overflow-hidden">
            {/* Student Photo in Chamfered Sci-Fi Frame (h-[285px]) */}
            <div className="relative w-full h-[285px] shrink-0">
              <div
                className="relative w-full h-full bg-neutral-900 border-[2.5px] border-black overflow-hidden shadow-[2px_2px_0px_#000]"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
                }}
              >
                {!imgError && (highResPhotoUrl || student.photoUrl) ? (
                  <img
                    src={highResPhotoUrl || student.photoUrl}
                    alt={student.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-neutral-300">
                    <User className="w-16 h-16 stroke-[1.5] text-neutral-400" />
                    <span className="text-sm font-black uppercase tracking-wider mt-2">
                      {student.name.split(' ')[0]}
                    </span>
                  </div>
                )}

                {/* ID Card Handwritten Stamp: Better Version Everyday */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-white/95 text-black border border-black font-mono font-black text-[9px] uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000] rotate-[-2deg] z-10">
                  Better Version Everyday
                </div>

                {/* Inner Cyber Accent Line */}
                <div
                  className="absolute inset-1 pointer-events-none border border-cyan-400/40"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
                  }}
                />

                {/* Three Diagonal Hash Marks /// in bottom right corner */}
                <div className="absolute bottom-2 right-2 flex items-center gap-0.5">
                  <span className="w-1 h-3.5 rotate-12" style={{ backgroundColor: themeConfig.accentColor }} />
                  <span className="w-1 h-3.5 rotate-12" style={{ backgroundColor: themeConfig.accentColor }} />
                  <span className="w-1 h-3.5 rotate-12" style={{ backgroundColor: themeConfig.accentColor }} />
                </div>
              </div>
            </div>

            {/* Bottom Row: SCAN TO CONNECT box + QR Code (h-[120px]) */}
            <div className="flex items-stretch gap-2.5 h-[120px] pt-1 shrink-0">
              {/* Lime/Theme Block: SCAN TO CONNECT ↗ with Spider Icon */}
              <div
                className="flex-1 p-2 border-[2.5px] border-black flex flex-col justify-between shadow-[2px_2px_0px_#000]"
                style={{ backgroundColor: themeConfig.accentColor }}
              >
                <div className="flex items-center justify-between text-black font-black text-xs tracking-tight uppercase leading-tight">
                  <span>{themeConfig.scanBoxText}</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                </div>

                <div className="flex items-center justify-center text-black py-1">
                  {activeThemeKey === 'spidey' ? (
                    <CrawlingSpider className="w-9 h-9" color="#000" />
                  ) : activeThemeKey === 'barbie' ? (
                    <span className="text-2xl">👑</span>
                  ) : activeThemeKey === 'iron-man' ? (
                    <span className="text-2xl">🦾</span>
                  ) : activeThemeKey === 'batman' ? (
                    <span className="text-2xl">🦇</span>
                  ) : activeThemeKey === 'cyberpunk' ? (
                    <span className="text-2xl">⚡</span>
                  ) : activeThemeKey === 'fire-pixel' ? (
                    <span className="text-2xl animate-pulse">🔥</span>
                  ) : (
                    <span className="text-xl font-bold font-mono">&gt;_ROOT</span>
                  )}
                </div>
              </div>

              {/* QR Code Container with Sci-Fi Brackets */}
              <QrCodeGraphic accentColor={themeConfig.accentColor} className="w-[100px] h-[100px]" />
            </div>

            {/* Cyber detail dots & Vector Smart Chip at base */}
            <div className="flex items-center justify-between pt-1 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-black border border-black" />
                <span className="w-2.5 h-2.5 bg-black border border-black" />
                <span className="w-2.5 h-2.5 bg-black border border-black" />
                <span className="text-[9px] font-black uppercase text-neutral-500 tracking-widest pl-1">
                  AUTH_CERT // 2026-IT
                </span>
              </div>
              <VectorSmartChip className="w-8 h-6" />
            </div>
          </div>

          {/* 
            --------------------------------------------------------------------
            COLUMN 2 (col-span-5, width ~400px): Identity Rows, Divider Lines & Bio
            --------------------------------------------------------------------
          */}
          <div className="col-span-5 flex flex-col justify-between h-full divide-y-[2px] divide-black overflow-hidden relative">
            {/* Hanging Spider decoration on divider lines for Spidey theme, or pixel flame for fire-pixel */}
            {activeThemeKey === 'spidey' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-85">
                <CrawlingSpider className="w-7 h-7" color="#000" />
              </div>
            )}
            {activeThemeKey === 'fire-pixel' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-90 flex flex-col items-center">
                <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(244,123,92,0.8)] animate-pulse">🔥</span>
                <span className="text-[7px] font-mono font-black text-[#f9c74f] tracking-widest uppercase">PIXEL</span>
              </div>
            )}

            {/* Row 1: NAME */}
            <div className="px-4 py-2.5 flex items-center gap-3 shrink-0">
              <div
                className={`w-8 h-8 ${themeConfig.iconBoxBg} ${themeConfig.iconBoxColor} border-2 border-black flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#000]`}
              >
                <User className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-70 block">
                  NAME
                </span>
                <span className="text-base font-black uppercase tracking-tight block truncate">
                  {student.name}
                </span>
              </div>
            </div>

            {/* Row 2: BRANCH */}
            <div className="px-4 py-2.5 flex items-center gap-3 shrink-0">
              <div
                className={`w-8 h-8 ${themeConfig.iconBoxBg} ${themeConfig.iconBoxColor} border-2 border-black flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#000]`}
              >
                <GraduationCap className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-70 block">
                  BRANCH
                </span>
                <span className="text-xs font-black uppercase tracking-tight block truncate">
                  {student.branch}
                </span>
              </div>
            </div>

            {/* Row 3: YEAR */}
            <div className="px-4 py-2.5 flex items-center gap-3 shrink-0">
              <div
                className={`w-8 h-8 ${themeConfig.iconBoxBg} ${themeConfig.iconBoxColor} border-2 border-black flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#000]`}
              >
                <Calendar className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-70 block">
                  YEAR
                </span>
                <span className="text-xs font-black uppercase tracking-tight block">
                  {student.year}
                </span>
              </div>
            </div>

            {/* Row 4: STUDENT ID & ROLL NO. */}
            <div className="px-4 py-2.5 flex items-center gap-3 shrink-0">
              <div
                className={`w-8 h-8 ${themeConfig.iconBoxBg} ${themeConfig.iconBoxColor} border-2 border-black flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#000]`}
              >
                <CreditCard className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="grid grid-cols-2 gap-2 min-w-0 flex-1">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-70 block">
                    STUDENT ID
                  </span>
                  <span className="text-xs font-black uppercase tracking-tight block font-mono text-indigo-700 dark:text-amber-300">
                    {student.id.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-70 block">
                    ROLL NO.
                  </span>
                  <span className="text-xs font-black uppercase tracking-tight block font-mono">
                    {formattedRoll}
                  </span>
                </div>
              </div>
            </div>

            {/* Row 5: DIVISION */}
            <div className="px-4 py-2.5 flex items-center gap-3 shrink-0">
              <div
                className={`w-8 h-8 ${themeConfig.iconBoxBg} ${themeConfig.iconBoxColor} border-2 border-black flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#000]`}
              >
                <Users className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-70 block">
                  DIVISION
                </span>
                <span className="text-xs font-black uppercase tracking-tight block">
                  {student.division}
                </span>
              </div>
            </div>

            {/* Row 6: ABOUT ME with SHOW MORE */}
            <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 ${themeConfig.iconBoxBg} ${themeConfig.iconBoxColor} border-2 border-black flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#000]`}
                >
                  <FileText className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-70 block">
                    ABOUT ME
                  </span>
                  <p
                    className={`text-xs font-medium leading-relaxed mt-0.5 ${
                      !showFullBio ? 'line-clamp-3' : 'line-clamp-4'
                    }`}
                  >
                    {student.description && student.description.trim().length > 0
                      ? student.description.trim()
                      : 'Curious mind, always up for new ideas and building cool stuff.'}
                  </p>
                </div>
              </div>

              {/* SHOW MORE Button */}
              <div className="flex justify-end pt-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="px-3 py-1 text-[10px] font-black uppercase tracking-wider border-2 border-black flex items-center gap-1 shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer text-black"
                  style={{ backgroundColor: themeConfig.accentColor }}
                >
                  <span>{showFullBio ? 'SHOW LESS' : 'SHOW MORE'}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* 
            --------------------------------------------------------------------
            COLUMN 3 (col-span-3, width ~240px): Tech Interests, Instagram, Tags & Batch
            --------------------------------------------------------------------
          */}
          <div className="col-span-3 flex flex-col justify-between h-full divide-y-[2px] divide-black overflow-hidden">
            {/* Box A: TECH INTERESTS with Corner Bracket ⌝ */}
            <div className="p-3 space-y-2 shrink-0">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs">&lt;/&gt;</span>
                  <span className="text-[11px]">TECH INTERESTS</span>
                </div>
                <span className="text-xs font-mono font-black">⌝</span>
              </div>

              {/* Grid of Pop Color Micro-Boxes */}
              {displayInterests.length > 0 ? (
                <div className={`grid ${displayInterests.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1.5`}>
                  {displayInterests.map((interest, idx) => {
                    const chipColor = themeConfig.chipColors[idx % themeConfig.chipColors.length];
                    return (
                      <div
                        key={idx}
                        className={`px-1.5 py-1 text-center text-[10px] font-black uppercase border-2 border-black truncate shadow-[1px_1px_0px_#000] ${chipColor.bg} ${chipColor.text}`}
                        title={interest}
                      >
                        {interest}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-2 text-center text-[10px] font-mono font-bold uppercase text-slate-500 bg-slate-100/60 border border-dashed border-slate-300 rounded">
                  NONE SPECIFIED
                </div>
              )}
            </div>

            {/* Box B: INSTAGRAM */}
            <div className="px-3 py-2 flex items-center gap-2.5 shrink-0">
              <div
                className="w-8 h-8 border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]"
                style={{ backgroundColor: themeConfig.secondaryAccent, color: '#000' }}
              >
                <Instagram className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-70 block">
                  INSTAGRAM
                </span>
                {student.instagramHandle ? (
                  <a
                    href={`https://instagram.com/${student.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-black hover:underline block truncate"
                  >
                    {student.instagramHandle.startsWith('@') ? student.instagramHandle : `@${student.instagramHandle}`}
                  </a>
                ) : (
                  <span className="text-xs font-mono font-semibold text-slate-500 block">
                    NOT CONNECTED
                  </span>
                )}
              </div>
            </div>

            {/* Box C: TAGS */}
            <div className="p-3 space-y-1.5 shrink-0">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]"
                  style={{ backgroundColor: themeConfig.secondaryAccent, color: '#000' }}
                >
                  <Tag className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-70">
                  TAGS
                </span>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1">
                {tagsList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.2 text-[9px] font-black border border-black bg-white text-black shadow-[1px_1px_0px_#000]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Box D: BATCH + SPIDER WEB CORNER */}
            <div className="flex items-stretch border-t-[2px] border-black flex-1 min-h-[90px]">
              {/* Batch Info */}
              <div className="flex-1 p-2.5 flex items-center gap-2">
                <div
                  className="w-7 h-7 border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]"
                  style={{ backgroundColor: themeConfig.secondaryAccent, color: '#000' }}
                >
                  <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-70 block">
                    BATCH
                  </span>
                  <span className="text-[11px] font-black uppercase block truncate">
                    {student.batch ? student.batch.replace('_', ' ') : 'Batch 2'}
                  </span>
                  <span className="text-[8px] font-bold opacity-75 block">
                    (2026 - 2027)
                  </span>
                </div>
              </div>

              {/* Corner Graphic Box */}
              <div
                className="w-20 border-l-[2px] border-black flex items-center justify-center p-1 relative overflow-hidden shrink-0"
                style={{ backgroundColor: themeConfig.accentColor }}
              >
                {activeThemeKey === 'spidey' ? (
                  <>
                    <div className="absolute right-0 bottom-0 pointer-events-none opacity-40">
                      <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" stroke="#000" strokeWidth="2">
                        <line x1="100" y1="100" x2="0" y2="40" />
                        <line x1="100" y1="100" x2="20" y2="0" />
                        <line x1="100" y1="100" x2="50" y2="0" />
                        <path d="M40 70 Q 60 70 70 40" />
                        <path d="M15 50 Q 50 50 50 15" />
                      </svg>
                    </div>
                    <CrawlingSpider className="w-10 h-10 z-10" color="#000" />
                  </>
                ) : activeThemeKey === 'fire-pixel' ? (
                  <div className="flex flex-col items-center justify-center text-[#1a1030] font-mono font-black text-center p-0.5 z-10 select-none">
                    <span className="text-xl">🔥</span>
                    <span className="text-[8px] tracking-widest font-black uppercase mt-0.5 leading-none">
                      PIXEL
                    </span>
                    <span className="text-[7px] tracking-wider uppercase font-bold opacity-80">
                      CORE
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl z-10">{themeConfig.emoji}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 3. BOTTOM CYBER STRIP (h-[32px]) ==================== */}
        <div className="h-[32px] border-t-[3px] border-black bg-black text-white px-3 flex items-center justify-between text-[10px] font-mono font-black shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-1.5"
              style={{ color: activeThemeKey === 'fire-pixel' ? '#f9c74f' : '#CCFF00' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: activeThemeKey === 'fire-pixel' ? '#f47b5c' : '#CCFF00' }}
              />
              <span>{activeThemeKey === 'fire-pixel' ? 'FIRING PIXEL MATRIX CERTIFIED · 8-STOP DUSK' : '100% DIGITAL VECTOR ID · ZERO BLUR'}</span>
            </span>
            <span className="text-[#FFE600] font-mono">
              STUDENT ID: {student.id.toUpperCase()}
            </span>
            <span className="text-neutral-400">
              HASH: 0x{student.id.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeConfig.accentColor }} />
            <span className="text-neutral-300">
              {student.branch.includes('Computer') ? 'CSE' : 'IT'} · DIV {student.division}
            </span>
          </div>
        </div>
      </div>

      {/* Optional In-Card Action Shortcut Bar (when rendered standalone) */}
      {showLikeShortcut && (
        <div className="w-[960px] mt-3 flex items-center justify-between px-1 gap-2 flex-wrap font-mono">
          <div className="flex items-center gap-2.5">
            <InteractiveReactionPill
              studentId={student.id}
              likes={student.likes}
              dislikes={student.dislikes}
              likedBy={student.likedBy}
              dislikedBy={student.dislikedBy}
              variant="neo"
              size="md"
            />

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-black text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
          </div>

          {isOwnProfile && onOpenPersonalDetails && (
            <button
              onClick={onOpenPersonalDetails}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#38BDF8] hover:bg-black text-black hover:text-[#38BDF8] text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Edit My Profile</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
