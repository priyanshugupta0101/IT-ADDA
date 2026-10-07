import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Users,
  FileText,
  FolderArchive,
  Bell,
  MessageSquare,
  ShieldCheck,
  User,
  Volume2,
  VolumeX,
  Flame,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'OVERVIEW' | 'MEMBERS' | 'NOTES' | 'RESOURCES' | 'NOTICES' | 'CHAT' | 'ADMIN';
  setActiveTab: (tab: 'OVERVIEW' | 'MEMBERS' | 'NOTES' | 'RESOURCES' | 'NOTICES' | 'CHAT' | 'ADMIN') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    setIsRegisterModalOpen,
    setIsPersonalDetailsOpen,
    unreadBadges,
    clearTabBadge,
    isRealtimeConnected,
    isFireSoundActive,
    toggleFireSound,
  } = useApp();

  // Clear unread badge whenever user opens that tab
  useEffect(() => {
    if (activeTab === 'NOTICES') clearTabBadge('NOTICES');
    if (activeTab === 'CHAT') clearTabBadge('CHAT');
    if (activeTab === 'RESOURCES') clearTabBadge('RESOURCES');
    if (activeTab === 'NOTES') clearTabBadge('NOTES');
  }, [activeTab]);

  const handleSelectTab = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    if (tabId === 'NOTICES') clearTabBadge('NOTICES');
    if (tabId === 'CHAT') clearTabBadge('CHAT');
    if (tabId === 'RESOURCES') clearTabBadge('RESOURCES');
    if (tabId === 'NOTES') clearTabBadge('NOTES');
  };

  const handleOpenMyProfile = () => {
    if (currentUser) {
      setIsPersonalDetailsOpen(true);
    } else {
      setIsRegisterModalOpen(true);
    }
  };

  const getBadgeCount = (tabId: typeof activeTab) => {
    if (tabId === 'NOTICES') return unreadBadges.notices;
    if (tabId === 'CHAT') return unreadBadges.chat;
    if (tabId === 'RESOURCES') return unreadBadges.resources;
    if (tabId === 'NOTES') return unreadBadges.notes;
    return 0;
  };

  const navLinks: { id: typeof activeTab; label: string; icon: React.ReactNode }[] = [
    { id: 'OVERVIEW', label: 'Campus Hub', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'MEMBERS', label: 'Students', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'NOTES', label: 'Notes', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'RESOURCES', label: 'PYQs & Papers', icon: <FolderArchive className="w-3.5 h-3.5" /> },
    { id: 'NOTICES', label: 'Notices', icon: <Bell className="w-3.5 h-3.5" /> },
    { id: 'CHAT', label: 'Batch Chat', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'ADMIN', label: 'Admin', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-2 sm:px-4 py-3 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-stretch justify-between border-2 border-[#f4e6c8]/80 bg-[#1a1030]/65 backdrop-blur-xl shadow-[6px_6px_0_rgba(6,4,16,0.65)] rounded-none sm:rounded-sm overflow-hidden min-h-[52px]">
        {/* Zone 1: Brand Wordmark (Matching SABLE//OS from ThreeUI retro dock) */}
        <div className="flex items-center shrink-0 border-r-2 border-[#4b2f7e]/70 bg-[#150c28]/60 backdrop-blur-md px-3 sm:px-4 py-2">
          <button
            onClick={() => handleSelectTab('OVERVIEW')}
            className="flex items-center gap-2.5 cursor-pointer text-left group"
          >
            <span
              className="w-5 h-5 flex items-center justify-center bg-[#f9c74f] text-[#1a1030] font-mono font-bold text-xs shadow-xs"
              aria-hidden="true"
            >
              +
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold tracking-wider font-mono text-[#f9c74f] uppercase">
                  IT ADDA // OS
                </span>
                {isRealtimeConnected && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 bg-[#f47b5c]/20 text-[#f47b5c] border border-[#f47b5c]/40 text-[9px] font-mono font-bold uppercase">
                    <span className="w-1 h-1 rounded-full bg-[#f47b5c] animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#a08fd4] font-mono block leading-none">
                FE IT · DIV A
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Fitted Terminal Dock Strip */}
        <nav
          className="hidden lg:flex flex-1 items-stretch min-w-0"
          aria-label="Terminal Dock"
        >
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            const badgeCount = getBadgeCount(link.id);

            return (
              <button
                key={link.id}
                onClick={() => handleSelectTab(link.id)}
                type="button"
                aria-pressed={isActive}
                className={`flex-1 min-w-0 px-2 sm:px-3 flex items-center justify-center gap-1.5 border-r-2 border-[#4b2f7e]/70 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#f9c74f] text-[#1a1030] font-bold shadow-inner'
                    : 'bg-[#241548]/60 backdrop-blur-md text-[#b9a7e8] hover:bg-[#3a2170]/80 hover:text-[#fff4d6]'
                }`}
              >
                <span className="relative flex items-center justify-center shrink-0">
                  {link.icon}
                  {badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-[14px] px-1 items-center justify-center bg-[#d34c53] text-[9px] font-mono font-bold text-white border border-[#f4e6c8]">
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                </span>
                <span className="truncate">{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: CTA Button (Matching ▶ RUN from ThreeUI retro dock) & User Dock */}
        <div className="flex items-stretch shrink-0">
          {/* Fire Noise Sound ON/OFF Toggle (Synchronized with firing pixel matrix animation) */}
          <button
            onClick={toggleFireSound}
            type="button"
            className={`px-3 sm:px-3.5 border-l-2 border-[#4b2f7e]/70 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-mono text-xs select-none ${
              isFireSoundActive
                ? 'bg-[#f47b5c] text-[#1a1030] font-bold shadow-inner'
                : 'bg-[#150c28]/70 text-[#a08fd4] hover:text-[#f9c74f] hover:bg-[#241548]/90'
            }`}
            title={
              isFireSoundActive
                ? 'Fire Pixel Sound: ON (Click to mute fire crackle noise)'
                : 'Fire Pixel Sound: OFF (Click to enable synchronized fire ambient noise)'
            }
          >
            {isFireSoundActive ? (
              <>
                <Flame className="w-3.5 h-3.5 text-[#1a1030] animate-pulse" />
                <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider">
                  FIRE SFX: ON
                </span>
                <Volume2 className="w-3.5 h-3.5 text-[#1a1030]" />
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 opacity-70" />
                <span className="hidden sm:inline text-[11px] uppercase tracking-wider opacity-80">
                  FIRE SFX: OFF
                </span>
              </>
            )}
          </button>

          {currentUser ? (
            <div className="flex items-stretch">
              <button
                onClick={handleOpenMyProfile}
                className="px-3.5 sm:px-4 bg-[#241548] hover:bg-[#3a2170] text-[#f9c74f] hover:text-[#fff4d6] border-l-2 border-[#4b2f7e] transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-mono text-xs"
                title="Account Settings, Profile & Logout"
              >
                <User className="w-4 h-4 text-[#f9c74f]" />
                <span className="uppercase text-[11px] font-bold">Profile</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-5 bg-[#f47b5c] hover:bg-[#f9c74f] text-[#1a1030] font-mono font-bold text-xs uppercase tracking-wider border-l-2 border-[#f4e6c8] transition-colors cursor-pointer"
            >
              <span aria-hidden="true">▶</span>
              <span>RUN // SIGN IN</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Fitted Strip */}
      <div className="lg:hidden mt-1.5 flex items-stretch overflow-x-auto scrollbar-none border-2 border-[#4b2f7e]/80 bg-[#1a1030]/65 backdrop-blur-xl">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          const badgeCount = getBadgeCount(link.id);

          return (
            <button
              key={link.id}
              onClick={() => handleSelectTab(link.id)}
              className={`flex-none px-3 py-1.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider border-r-2 border-[#4b2f7e]/70 transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#f9c74f] text-[#1a1030] font-bold'
                  : 'bg-[#241548]/60 backdrop-blur-md text-[#b9a7e8] hover:bg-[#3a2170]/80'
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
              {badgeCount > 0 && (
                <span className="px-1 bg-[#d34c53] text-white text-[8px] font-bold">
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
