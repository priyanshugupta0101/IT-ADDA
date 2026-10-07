import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { GenZIdCard } from './GenZIdCard';
import { InteractiveReactionPill } from './InteractiveReactionPill';
import { IdCardTheme } from '../types';
import { ID_CARD_THEMES } from '../utils/idCardThemes';
import {
  X,
  CreditCard,
  Share2,
  Edit3,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
} from 'lucide-react';

export const StudentIdCardModal: React.FC = () => {
  const {
    viewingStudent,
    setViewingStudent,
    currentUser,
    setIsPersonalDetailsOpen,
    updateStudentProfile,
  } = useApp();

  const [selectedTheme, setSelectedTheme] = useState<IdCardTheme | null>(null);
  const [fitScale, setFitScale] = useState(1);
  const [zoomMultiplier, setZoomMultiplier] = useState(1);
  const [is100PercentMode, setIs100PercentMode] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Two-Finger Pinch-to-Zoom Vector Engine Refs
  const initialTouchDistanceRef = useRef<number | null>(null);
  const initialZoomMultiplierRef = useRef<number>(1);

  // Check if viewing own profile
  const isOwnProfile = Boolean(currentUser && viewingStudent && currentUser.id === viewingStudent.id);

  // Active theme: for own profile, allows theme selection preview; for others, strictly viewingStudent's saved theme
  const activeTheme: IdCardTheme = isOwnProfile
    ? (selectedTheme || viewingStudent?.idCardTheme || (viewingStudent?.gender === 'Girls' ? 'barbie' : 'spidey'))
    : (viewingStudent?.idCardTheme || (viewingStudent?.gender === 'Girls' ? 'barbie' : 'spidey'));

  // Reset theme override and zoom when viewing a new student
  useEffect(() => {
    setSelectedTheme(null);
    setIsRotated(false);
    setZoomMultiplier(1);
    setIs100PercentMode(false);
  }, [viewingStudent?.id]);

  // Dynamic Auto-Fitting Base Scale Calculation measuring container
  useEffect(() => {
    if (!viewingStudent) return;

    const calculateFit = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const CARD_W = 960;
      const CARD_H = 570;

      let availW = vw - 32;
      let availH = vh - (isOwnProfile ? 140 : 80);

      if (scrollContainerRef.current) {
        const cw = scrollContainerRef.current.clientWidth;
        const ch = scrollContainerRef.current.clientHeight;
        if (cw > 50 && ch > 50) {
          availW = cw - 24;
          availH = ch - 24;
        }
      }

      if (isRotated) {
        const s = Math.min(availW / CARD_H, availH / CARD_W, 1.0);
        setFitScale(Math.max(s, 0.25));
      } else {
        const s = Math.min(availW / CARD_W, availH / CARD_H, 1.0);
        setFitScale(Math.max(s, 0.25));
      }
    };

    calculateFit();
    const timer = setTimeout(calculateFit, 50);
    window.addEventListener('resize', calculateFit);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateFit);
    };
  }, [viewingStudent, isRotated, isOwnProfile]);

  if (!viewingStudent) return null;

  const currentScale = is100PercentMode
    ? Math.min(Math.max(1.0 * zoomMultiplier, 0.4), 3.5)
    : Math.min(Math.max(fitScale * zoomMultiplier, 0.25), 3.5);

  const displayPercentage = Math.round(currentScale * 100);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIs100PercentMode(false);
    setZoomMultiplier((prev) => Math.min(prev * 1.25, 3.5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIs100PercentMode(false);
    setZoomMultiplier((prev) => Math.max(prev * 0.8, 0.4));
  };

  const handleResetFit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIs100PercentMode(false);
    setZoomMultiplier(1);
  };

  const handleToggle100Percent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIs100PercentMode(!is100PercentMode);
    setZoomMultiplier(1);
  };

  // Two-Finger Touch Pinch Zoom Handlers (Vector re-render identical to plus icon)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialTouchDistanceRef.current = dist;
      initialZoomMultiplierRef.current = zoomMultiplier;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistanceRef.current !== null) {
      // Prevent browser's native raster viewport zoom to maintain crisp vector resolution
      if (e.cancelable) e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / initialTouchDistanceRef.current;
      const newZoom = Math.min(Math.max(initialZoomMultiplierRef.current * ratio, 0.4), 3.5);
      setIs100PercentMode(false);
      setZoomMultiplier(newZoom);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialTouchDistanceRef.current = null;
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `Check out ${viewingStudent.name}'s verified Student ID on IT Adda: Roll #${viewingStudent.rollNumber} (${viewingStudent.division})`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser && isOwnProfile) {
      updateStudentProfile(currentUser.id, { idCardTheme: activeTheme });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#060410]/80 backdrop-blur-xl flex flex-col items-center justify-between p-2 sm:p-4 overflow-hidden select-none font-mono"
      onClick={() => setViewingStudent(null)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 
        ========================================================================
        CASE 1: VIEWING ANOTHER USER'S ID CARD
        "the user will only see the ID card, nothing else. To change the theme, the user can only change the theme of their own ID card, nothing, no one else."
        ========================================================================
      */}
      {!isOwnProfile ? (
        <>
          {/* Minimal Floating Top Bar */}
          <div
            className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs shrink-0 py-1.5 z-50 flex-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Identity Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#150c28] text-[#f4e6c8] border-2 border-[#4b2f7e] shadow-[3px_3px_0_rgba(6,4,16,0.8)] text-xs flex-wrap">
              <CreditCard className="w-4 h-4 text-[#ff9844] shrink-0" />
              <span className="font-bold truncate max-w-[160px] sm:max-w-none">{viewingStudent.name}</span>
              <span className="px-1.5 py-0.5 bg-[#241344] text-[#ff9844] border border-[#ff9844]/60 font-mono font-bold text-[10px]">
                ID: {viewingStudent.id}
              </span>
              {(viewingStudent.role === 'DEVELOPER_ADMIN' || viewingStudent.isDeveloper) && (
                <span className="px-1.5 py-0.5 bg-[#f9c74f] text-[#1a1030] font-mono font-extrabold text-[10px] border border-[#f4e6c8]">
                  ⚡ DEVELOPER / ADMIN
                </span>
              )}
              <span className="text-[#e2a87a] font-mono text-[11px]">Roll #{String(viewingStudent.rollNumber).padStart(2, '0')}</span>
              <span className="text-[#a05282]">·</span>
              <span className="text-[#c8a8d8] text-[11px]">{viewingStudent.division}</span>
            </div>

            {/* Floating Zoom & Close Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#150c28] border-2 border-[#4b2f7e] p-0.5 text-[#f4e6c8] shadow-[3px_3px_0_rgba(6,4,16,0.8)]">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:text-[#f4e6c8] hover:bg-[#241344] transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleResetFit}
                  className="px-2 py-1 text-[11px] font-bold hover:bg-[#241344] hover:text-[#f4e6c8] transition-colors cursor-pointer uppercase tracking-wider"
                  title="Auto-Fit"
                >
                  Fit ({displayPercentage}%)
                </button>

                <button
                  onClick={handleToggle100Percent}
                  className={`px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer uppercase tracking-wider ${
                    is100PercentMode ? 'bg-[#ff9844] text-[#060410] font-black' : 'hover:bg-[#241344] hover:text-[#f4e6c8]'
                  }`}
                  title="100% Vector Crisp Mode"
                >
                  100%
                </button>

                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:text-[#f4e6c8] hover:bg-[#241344] transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setViewingStudent(null)}
                className="pixel-btn-crimson py-1.5! px-2.5! cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 
            PERFECTLY CENTERED CARD CANVAS
            Using center-origin scale + exact placeholder dimensions with m-auto.
            100% centered horizontally and vertically, no offset, no blur!
          */}
          <div
            ref={scrollContainerRef}
            className="flex-1 w-full flex items-center justify-center overflow-auto p-2 sm:p-4 overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: `${960 * currentScale}px`,
                height: `${570 * currentScale}px`,
                minWidth: `${960 * currentScale}px`,
                minHeight: `${570 * currentScale}px`,
              }}
              className="relative flex items-center justify-center m-auto shrink-0 select-text"
            >
              <div
                style={{
                  width: '960px',
                  height: '570px',
                  transform: `scale(${currentScale})`,
                  transformOrigin: 'center center',
                }}
                className="absolute shrink-0 flex items-center justify-center"
              >
                <GenZIdCard
                  student={viewingStudent}
                  selectedTheme={activeTheme}
                  isOwnProfile={false}
                  showLikeShortcut={false}
                  showThemeBar={false}
                />
              </div>
            </div>
          </div>

          {/* Floating Bottom Reaction Bar for Visiting Peers */}
          <div
            className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs shrink-0 py-1.5 flex-wrap z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <InteractiveReactionPill
                studentId={viewingStudent.id}
                likes={viewingStudent.likes}
                dislikes={viewingStudent.dislikes}
                likedBy={viewingStudent.likedBy}
                dislikedBy={viewingStudent.dislikedBy}
                variant="dark"
                size="md"
                showDislikeCount={true}
              />

              <button
                onClick={handleShare}
                className="pixel-btn-secondary py-1.5! px-3.5! cursor-pointer"
                title="Share ID Card link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-[#150c28] border-2 border-[#4b2f7e] text-[#f4e6c8] text-xs">
              <ShieldCheck className="w-4 h-4 text-[#ff9844]" />
              <span className="font-bold uppercase tracking-wider text-[11px]">Verified IT Student Member</span>
            </div>
          </div>
        </>
      ) : (
        /* 
          ======================================================================
          CASE 2: VIEWING OWN ID CARD
          Full controls: Change theme, set default, edit profile, rotate, zoom
          ======================================================================
        */
        <>
          {/* Top Controls Bar */}
          <div
            className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs shrink-0 py-1 flex-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Student Identity Pill */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#150c28] text-[#f4e6c8] border-2 border-[#4b2f7e] shadow-[3px_3px_0_rgba(6,4,16,0.8)] shrink-0 flex-wrap">
              <CreditCard className="w-4 h-4 text-[#ff9844]" />
              <span className="font-bold">{viewingStudent.name}</span>
              <span className="px-2 py-0.5 bg-[#241344] text-[#ff9844] border border-[#ff9844]/60 font-mono font-bold text-xs tracking-wider">
                ID: {viewingStudent.id}
              </span>
              {(viewingStudent.role === 'DEVELOPER_ADMIN' || viewingStudent.isDeveloper) && (
                <span className="px-1.5 py-0.5 bg-[#f9c74f] text-[#1a1030] font-mono font-extrabold text-[10px] border border-[#f4e6c8]">
                  ⚡ DEVELOPER / ADMIN
                </span>
              )}
              <span className="text-[#e2a87a] font-mono text-[11px]">#{viewingStudent.rollNumber}</span>
              <span className="text-[#a05282]">·</span>
              <span className="text-[#c8a8d8] text-[11px]">{viewingStudent.division}</span>
            </div>

            {/* Center: Card Theme Selector (Only for own profile) */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
              {(Object.keys(ID_CARD_THEMES) as IdCardTheme[]).map((tKey) => {
                const t = ID_CARD_THEMES[tKey];
                const isSelected = activeTheme === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => setSelectedTheme(tKey)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap uppercase tracking-wider border-2 ${
                      isSelected
                        ? 'bg-[#ff9844] text-[#060410] border-[#f4e6c8] shadow-[2px_2px_0_#f4e6c8]'
                        : 'bg-[#150c28] text-[#c8a8d8] hover:text-[#f4e6c8] hover:bg-[#241344] border-[#4b2f7e]'
                    }`}
                    title={t.tagline}
                  >
                    <span>{t.emoji}</span>
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Digital Zoom & Close */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Zoom Controls */}
              <div className="flex items-center bg-[#150c28] border-2 border-[#4b2f7e] p-0.5 text-[#f4e6c8] shadow-[3px_3px_0_rgba(6,4,16,0.8)]">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:text-[#f4e6c8] hover:bg-[#241344] transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleResetFit}
                  className="px-2 py-1 text-[11px] font-bold hover:bg-[#241344] hover:text-[#f4e6c8] transition-colors cursor-pointer uppercase tracking-wider"
                  title="Auto-Fit Screen"
                >
                  Fit ({displayPercentage}%)
                </button>

                <button
                  onClick={handleToggle100Percent}
                  className={`px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer uppercase tracking-wider ${
                    is100PercentMode ? 'bg-[#ff9844] text-[#060410] font-black' : 'hover:bg-[#241344] hover:text-[#f4e6c8]'
                  }`}
                  title="100% Vector Crisp Mode"
                >
                  100%
                </button>

                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:text-[#f4e6c8] hover:bg-[#241344] transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rotate Toggle */}
              <button
                onClick={() => setIsRotated(!isRotated)}
                className={`p-2 border-2 transition-colors cursor-pointer shadow-[2px_2px_0_rgba(6,4,16,0.8)] ${
                  isRotated
                    ? 'bg-[#ff9844] text-[#060410] border-[#f4e6c8]'
                    : 'bg-[#150c28] text-[#c8a8d8] hover:text-[#f4e6c8] hover:bg-[#241344] border-[#4b2f7e]'
                }`}
                title="Rotate 90 degrees"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Close Modal */}
              <button
                onClick={() => setViewingStudent(null)}
                className="pixel-btn-crimson py-1.5! px-2.5! cursor-pointer"
                title="Close Card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 
            PERFECTLY CENTERED CARD CANVAS (WITH ROTATION SUPPORT)
            center-origin scale + exact placeholder dimensions with m-auto.
          */}
          <div
            ref={scrollContainerRef}
            className="flex-1 w-full flex items-center justify-center overflow-auto p-2 sm:p-4 overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: isRotated ? `${570 * currentScale}px` : `${960 * currentScale}px`,
                height: isRotated ? `${960 * currentScale}px` : `${570 * currentScale}px`,
                minWidth: isRotated ? `${570 * currentScale}px` : `${960 * currentScale}px`,
                minHeight: isRotated ? `${960 * currentScale}px` : `${570 * currentScale}px`,
              }}
              className="relative flex items-center justify-center m-auto shrink-0 select-text"
            >
              <div
                style={{
                  width: '960px',
                  height: '570px',
                  transform: `scale(${currentScale}) ${isRotated ? 'rotate(90deg)' : ''}`,
                  transformOrigin: 'center center',
                }}
                className="absolute shrink-0 flex items-center justify-center"
              >
                <GenZIdCard
                  student={viewingStudent}
                  selectedTheme={activeTheme}
                  onThemeChange={(theme) => setSelectedTheme(theme)}
                  isOwnProfile={true}
                  showLikeShortcut={false}
                  showThemeBar={false}
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Bar (Only for own profile) */}
          <div
            className="w-full max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs shrink-0 py-1 flex-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Like & Dislike Interactive Dock & Share */}
            <div className="flex items-center gap-2.5">
              <InteractiveReactionPill
                studentId={viewingStudent.id}
                likes={viewingStudent.likes}
                dislikes={viewingStudent.dislikes}
                likedBy={viewingStudent.likedBy}
                dislikedBy={viewingStudent.dislikedBy}
                variant="dark"
                size="lg"
                showDislikeCount={true}
              />

              <button
                onClick={handleShare}
                className="pixel-btn-secondary py-2! px-3.5! cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

            {/* Center: Verified Seal Info */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-[#150c28] border-2 border-[#4b2f7e] text-[#f4e6c8] text-xs">
              <ShieldCheck className="w-4 h-4 text-[#ff9844]" />
              <span className="font-bold uppercase tracking-wider text-[11px]">Official Academic Smart ID · 100% Vector</span>
            </div>

            {/* Right: Save Theme or Edit Profile */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveTheme}
                className="pixel-btn-secondary py-2! px-3.5! cursor-pointer"
              >
                {savedFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#ff9844]" />
                    <span>Saved Default</span>
                  </>
                ) : (
                  <span>Set as Default</span>
                )}
              </button>

              <button
                onClick={() => {
                  setViewingStudent(null);
                  setIsPersonalDetailsOpen(true);
                }}
                className="pixel-btn-primary py-2! px-4! cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
