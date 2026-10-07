import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { TopLeaderboard } from './components/TopLeaderboard';
import { StudentStreakSection } from './components/StudentStreakSection';
import { BrowseMembers } from './components/BrowseMembers';
import { NotesSection } from './components/NotesSection';
import { ImpResourcesSection } from './components/ImpResourcesSection';
import { NoticeSection } from './components/NoticeSection';
import { PublicChat } from './components/PublicChat';
import { AdminPanel } from './components/AdminPanel';
import { RegisterModal } from './components/RegisterModal';
import { PersonalDetailsModal } from './components/PersonalDetailsModal';
import { StudentIdCardModal } from './components/StudentIdCardModal';
import { FiringPixelMatrixBackground } from './components/FiringPixelMatrixBackground';
import { soundEngine } from './utils/soundEffects';
import {
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
  Mail,
  Instagram,
} from 'lucide-react';

function MainContent() {
  const {
    currentUser,
    setViewingStudent,
    setIsRegisterModalOpen,
    theme,
    campusVibeConfig,
    voteCampusVibe,
    developerFooterConfig,
  } = useApp();

  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'MEMBERS' | 'NOTES' | 'RESOURCES' | 'NOTICES' | 'CHAT' | 'ADMIN'
  >('OVERVIEW');

  // Campus Daily Vibe Poll (interactive for daily engagement)
  const [selectedVibe, setSelectedVibe] = useState<string | null>(() => {
    try {
      return localStorage.getItem('nexusit_today_vibe');
    } catch {
      return null;
    }
  });

  const [vibeVoteEffect, setVibeVoteEffect] = useState<{ id: string; emoji: string } | null>(null);

  const handleVoteVibe = (vibeId: string) => {
    if (selectedVibe === vibeId) return;
    const previous = selectedVibe || undefined;
    const selectedOption = (campusVibeConfig?.options || []).find((o) => o.id === vibeId);

    soundEngine.playVibeVoteSound();
    setVibeVoteEffect({ id: vibeId, emoji: selectedOption?.icon || '✨' });
    setSelectedVibe(vibeId);
    try {
      localStorage.setItem('nexusit_today_vibe', vibeId);
    } catch {
      // Ignore
    }
    voteCampusVibe(vibeId, previous);

    setTimeout(() => {
      setVibeVoteEffect(null);
    }, 950);
  };

  const totalVibeVotes = (campusVibeConfig?.options || []).reduce(
    (acc, curr) => acc + (curr.count || 0),
    0
  );

  return (
    <div
      className="min-h-screen flex flex-col font-mono selection:bg-[#f47b5c] selection:text-[#1a1030] relative overflow-x-hidden bg-[#0b0819] text-[#f4e6c8]"
    >
      {/* ThreeUI WebGL Firing Pixel Matrix Dynamic Background (Props from settings reference) */}
      <FiringPixelMatrixBackground
        pixelSize={4}
        levels={7}
        noise={1.00}
        scanlines={0.32}
        speed={1.00}
      />

      {/* Top Bar Navigation */}
      <div className="relative z-40">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* OVERVIEW TAB - Dynamic Student Hub Homepage */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8">
            {/* Campus Header & Daily Pulse Hero */}
            <div
              className="relative rounded-2xl overflow-hidden border-2 border-[#4b2f7e]/75 p-6 sm:p-8 backdrop-blur-xl bg-[#150c28]/60 text-white shadow-[6px_6px_0_rgba(6,4,16,0.65)]"
            >
              <div
                className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-[#f47b5c]/10"
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 border border-[#f4e6c8]/50 bg-[#241548]/70 backdrop-blur-md text-[#f9c74f] text-xs font-mono font-semibold mb-3 shadow-[2px_2px_0_#060410]"
                  >
                    <span className="w-2 h-2 bg-[#f47b5c] animate-pulse" />
                    <span>Department of Information Technology · Division A (2026–2027)</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight font-headline text-white">
                    Welcome to{' '}
                    <span className="text-[#f9c74f] drop-shadow-[0_2px_12px_rgba(249,199,79,0.35)]">
                      IT Adda
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-[#b9a7e8] font-mono mt-2 max-w-xl">
                    Official academic collaboration portal. Access peer-reviewed notes, exam PYQs, official circulars, and connect with batchmates.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="border-2 border-[#4b2f7e] bg-[#1a1030]/80 p-4 shadow-[4px_4px_0_#060410] text-center min-w-[200px]">
                    <span className="text-[10px] text-[#f47b5c] uppercase font-bold font-mono tracking-widest block">
                      ● SYSTEM STATUS
                    </span>
                    <p className="text-base font-bold text-white font-mono mt-1">FE IT PORTAL // ACTIVE</p>
                    <span className="text-[11px] text-[#a08fd4] font-mono block mt-0.5">Division A · Batch 1/2/3</span>
                  </div>
                </div>
              </div>

              {/* Interactive Daily Campus Vibe Poll (Fully customized from Admin Panel) */}
              <div className="mt-6 pt-6 border-t-2 border-[#4b2f7e]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold font-mono text-[#f9c74f]">
                      ⚡ {campusVibeConfig?.title || "Today's Campus Vibe"}
                    </span>
                    <span className="text-xs text-[#a08fd4]">
                      · {campusVibeConfig?.subtitle || 'Tap what describes your study mood today'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-medium text-[#b9a7e8] shrink-0">
                    {totalVibeVotes} classmates voted
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(campusVibeConfig?.options || []).map((vibe) => {
                    const isSelected = selectedVibe === vibe.id;
                    const isJustVoted = vibeVoteEffect?.id === vibe.id;
                    const percent =
                      totalVibeVotes > 0
                        ? Math.round(((vibe.count || 0) / totalVibeVotes) * 100)
                        : 0;

                    return (
                      <button
                        key={vibe.id}
                        onClick={() => handleVoteVibe(vibe.id)}
                        className={`relative rounded-lg p-3 text-left transition-all border-2 overflow-hidden cursor-pointer backdrop-blur-md ${
                          isJustVoted
                            ? 'ring-2 ring-[#f9c74f] scale-[1.02] z-20'
                            : isSelected
                            ? 'bg-[#f9c74f] text-[#1a1030] border-[#f4e6c8] shadow-[3px_3px_0_#060410]'
                            : 'bg-[#241548]/60 hover:bg-[#3a2170]/80 text-[#b9a7e8] border-[#4b2f7e]/80 shadow-[3px_3px_0_#060410]'
                        }`}
                      >
                        {/* Floating Celebration Animation on Vote */}
                        {isJustVoted && (
                          <div className="absolute -top-3 right-2 z-30 pointer-events-none font-bold text-xs animate-vibe-float whitespace-nowrap">
                            <span className="text-[#1a1030] bg-[#f9c74f] px-2 py-0.5 rounded shadow-lg border border-[#f4e6c8] flex items-center gap-1 font-mono text-[10px]">
                              <span>{vibe.icon}</span>
                              <span>+1 Voted!</span>
                            </span>
                          </div>
                        )}

                        {/* Progress Bar background */}
                        <div
                          className={`absolute bottom-0 left-0 top-0 transition-all duration-500 pointer-events-none ${
                            isSelected ? 'bg-black/10' : 'bg-[#f47b5c]/20'
                          }`}
                          style={{ width: `${percent}%` }}
                        />

                        <div className="relative z-10 flex items-center justify-between gap-1">
                          <span className="text-base">{vibe.icon}</span>
                          <span
                            className={`text-xs font-mono font-bold ${
                              isSelected ? 'text-[#1a1030]' : 'text-[#f9c74f]'
                            }`}
                          >
                            {percent}%
                          </span>
                        </div>
                        <p
                          className={`relative z-10 text-xs font-semibold mt-1 truncate ${
                            isSelected ? 'text-[#1a1030]' : 'text-white'
                          }`}
                        >
                          {vibe.label}
                        </p>
                        <div
                          className={`relative z-10 flex items-center justify-between mt-1 text-[10px] font-mono ${
                            isSelected ? 'text-[#1a1030]/80' : 'text-[#a08fd4]'
                          }`}
                        >
                          <span>{vibe.count || 0} votes</span>
                          {isSelected && (
                            <span className="text-[#1a1030] font-bold flex items-center gap-0.5">
                              ✓ voted
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dedicated Student Streak Counter Section */}
            <div className="pt-1">
              <StudentStreakSection onSelectStudent={(student) => setViewingStudent(student)} />
            </div>

            {/* Leaderboard Section (With the required Centered Total Number of Members Box) */}
            <div className="pt-2">
              <TopLeaderboard onSelectStudent={(student) => setViewingStudent(student)} />
            </div>
          </div>
        )}

        {/* BROWSE MEMBERS TAB */}
        {activeTab === 'MEMBERS' && <BrowseMembers />}

        {/* NOTES EXCHANGE TAB */}
        {activeTab === 'NOTES' && <NotesSection />}

        {/* IMP RESOURCES TAB */}
        {activeTab === 'RESOURCES' && <ImpResourcesSection />}

        {/* NOTICES TAB */}
        {activeTab === 'NOTICES' && (
          <NoticeSection onOpenAdminPanel={() => setActiveTab('ADMIN')} />
        )}

        {/* PUBLIC CHAT TAB */}
        {activeTab === 'CHAT' && <PublicChat />}

        {/* ADMIN PANEL TAB */}
        {activeTab === 'ADMIN' && <AdminPanel />}
      </main>

      {/* Platform Bottom Text Footer (Clean non-banner text display as requested) */}
      <footer className="relative z-20 w-full py-8 sm:py-10 px-4 text-center border-t border-[#4b2f7e]/60 font-mono mt-8 bg-[#0b0819]/50 backdrop-blur-xs">
        <div className="max-w-xl mx-auto space-y-1.5">
          <p className="text-xs sm:text-sm font-bold text-[#f9c74f] uppercase tracking-wider">
            Developed by {developerFooterConfig?.devName || 'Priyanshu Gupta'}
          </p>
          <p className="text-[11px] sm:text-xs text-[#a08fd4] leading-relaxed">
            {developerFooterConfig?.message || 'If you spot any bug or have some suggestions, connect with me'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3 sm:gap-5 flex-wrap text-xs">
            <a
              href={`mailto:${developerFooterConfig?.email || 'guptapriyanshu0101@gmail.com'}`}
              className="inline-flex items-center gap-1.5 text-[#f4e6c8] hover:text-[#f9c74f] transition-colors cursor-pointer group"
            >
              <Mail className="w-3.5 h-3.5 text-[#f47b5c]" />
              <span className="underline decoration-[#4b2f7e] group-hover:decoration-[#f9c74f]">
                {developerFooterConfig?.email || 'guptapriyanshu0101@gmail.com'}
              </span>
            </a>
            <span className="text-[#4b2f7e]">·</span>
            <a
              href={`https://instagram.com/${(developerFooterConfig?.instagram || '@priyanshu_01928').replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#f4e6c8] hover:text-[#f9c74f] transition-colors cursor-pointer group"
            >
              <Instagram className="w-3.5 h-3.5 text-[#f47b5c]" />
              <span className="underline decoration-[#4b2f7e] group-hover:decoration-[#f9c74f]">
                {developerFooterConfig?.instagram || '@priyanshu_01928'}
              </span>
            </a>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <RegisterModal onOpenAdminPanel={() => setActiveTab('ADMIN')} />
      <PersonalDetailsModal />
      <StudentIdCardModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
