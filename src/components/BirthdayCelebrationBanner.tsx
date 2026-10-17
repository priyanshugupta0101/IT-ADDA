import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StudentProfile } from '../types';
import {
  isTodayBirthday,
  getStudentsWithBirthdayToday,
  triggerBirthdayCelebration,
  calculateAge,
  getZodiacSign,
} from '../utils/birthdayUtils';
import {
  PartyPopper,
  Sparkles,
  Heart,
  ChevronDown,
  ChevronUp,
  Cake,
  Volume2,
} from 'lucide-react';

interface BirthdayCelebrationBannerProps {
  onOpenCard?: (student: StudentProfile) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const BirthdayCelebrationBanner: React.FC<BirthdayCelebrationBannerProps> = ({
  onOpenCard,
  onNavigateToTab,
}) => {
  const { students, currentUser, setViewingStudent, isAdminUnlocked } = useApp();

  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [testCelebrantIndex, setTestCelebrantIndex] = useState<number | null>(null);

  // Detect students whose birthday is today
  const actualBirthdayStudents = useMemo(() => {
    return getStudentsWithBirthdayToday(students);
  }, [students]);

  // If testing or simulated, allow previewing with an approved student
  const activeBirthdayStudents = useMemo(() => {
    if (actualBirthdayStudents.length > 0) {
      return actualBirthdayStudents;
    }
    if (testCelebrantIndex !== null && students.length > 0) {
      const target = students[testCelebrantIndex % students.length];
      if (target) return [target];
    }
    return [];
  }, [actualBirthdayStudents, testCelebrantIndex, students]);

  const hasBirthdays = activeBirthdayStudents.length > 0;

  // Auto-trigger confetti once per session when a birthday is detected today
  useEffect(() => {
    if (hasBirthdays && typeof window !== 'undefined') {
      const todayKey = new Date().toISOString().slice(0, 10);
      const sessionKey = `nexusit_bday_celebrated_${todayKey}`;
      const alreadyTriggered = sessionStorage.getItem(sessionKey);

      if (!alreadyTriggered) {
        // Slight delay so the page loads and user sees the blast
        const timer = setTimeout(() => {
          triggerBirthdayCelebration(false); // Silent burst on initial mount
          sessionStorage.setItem(sessionKey, 'true');
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [hasBirthdays]);

  // Check if current logged-in user is one of the birthday stars
  const isCurrentUserBirthday = useMemo(() => {
    if (!currentUser?.dateOfBirth) return false;
    return isTodayBirthday(currentUser.dateOfBirth);
  }, [currentUser]);

  if (!hasBirthdays) {
    return null;
  }

  const primaryCelebrant = activeBirthdayStudents[0];
  const celebrantAge = calculateAge(primaryCelebrant.dateOfBirth);
  const zodiac = getZodiacSign(primaryCelebrant.dateOfBirth);

  const handleCelebrateClick = () => {
    triggerBirthdayCelebration(true);
  };

  const handleViewCard = (student: StudentProfile) => {
    if (onOpenCard) {
      onOpenCard(student);
    } else {
      setViewingStudent(student);
    }
  };

  // Minimized compact pill
  if (isMinimized) {
    return (
      <div className="w-full bg-gradient-to-r from-[#2b104b] via-[#481358] to-[#241244] border-b-2 border-[#f9c74f] px-3 py-1 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-50">
        <button
          onClick={handleCelebrateClick}
          className="flex items-center gap-2 text-xs font-mono font-bold text-[#f9c74f] hover:text-white transition-colors cursor-pointer"
        >
          <span className="text-base animate-bounce">🎂</span>
          <span className="truncate">
            🎉 Today is {primaryCelebrant.name}&apos;s Birthday!
          </span>
          <PartyPopper className="w-3.5 h-3.5 text-[#f47b5c]" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCelebrateClick}
            className="px-2 py-0.5 bg-[#f47b5c] hover:bg-[#f9c74f] text-[#1a1030] font-bold text-[10px] font-mono rounded shadow cursor-pointer transition-colors"
          >
            🎉 Celebrate
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 text-[#a08fd4] hover:text-white transition-colors cursor-pointer"
            title="Expand birthday banner"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside
      aria-label="Campus Birthday Announcement"
      className="relative w-full z-50 overflow-hidden bg-gradient-to-r from-[#210c3b] via-[#3d1049] to-[#1e0a35] border-b-2 border-[#f9c74f] shadow-[0_6px_20px_rgba(249,199,79,0.25)] animate-birthday-glow"
    >
      {/* Decorative background glow and floating party lights */}
      <div className="absolute top-0 left-1/4 w-72 h-16 bg-[#f47b5c]/20 blur-2xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-72 h-16 bg-[#f9c74f]/20 blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-3 py-2">
        {/* Left Badge: Official Campus Announcement Tag */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f9c74f] text-[#1a1030] border-2 border-[#f4e6c8] font-mono text-[11px] font-extrabold shadow-[2px_2px_0_#060410] rounded-sm select-none">
            <span className="animate-spin text-sm" style={{ animationDuration: '6s' }}>🎂</span>
            <span>TODAY&apos;S BIRTHDAY</span>
          </div>

          {/* Quick Audio / Fanfare Button */}
          <button
            type="button"
            onClick={handleCelebrateClick}
            className="p-1.5 bg-[#241548] hover:bg-[#381a70] text-[#f9c74f] border border-[#4b2f7e] rounded transition-colors cursor-pointer"
            title="Play Birthday Fanfare Music & Confetti"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Infinite Marquee Banner Ticker */}
        <div className="relative flex-1 overflow-hidden h-7 flex items-center mx-1 sm:mx-4 bg-[#140827]/70 border border-[#4b2f7e]/80 rounded px-2">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-mono">
            {/* Repeated twice for seamless CSS loop */}
            {[0, 1].map((copyIdx) => (
              <div key={copyIdx} className="flex items-center gap-8 shrink-0">
                {activeBirthdayStudents.map((student) => (
                  <div
                    key={`${copyIdx}-${student.id}`}
                    className="inline-flex items-center gap-2.5 text-[#f4e6c8]"
                  >
                    <span className="text-sm">🎈</span>
                    <span className="text-[#a08fd4]">Wishing</span>
                    <button
                      type="button"
                      onClick={() => handleViewCard(student)}
                      className="font-bold text-[#f9c74f] hover:underline cursor-pointer flex items-center gap-1 text-sm tracking-wide"
                    >
                      <span>{student.name}</span>
                      {celebrantAge && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#f47b5c] text-[#1a1030] font-mono font-bold rounded">
                          Turning {celebrantAge}!
                        </span>
                      )}
                    </button>
                    <span className="text-[#a08fd4]">
                      (Roll #{student.rollNumber} · {student.division})
                    </span>
                    <span className="text-white font-semibold">
                      a very Happy Birthday!
                    </span>
                    {zodiac && (
                      <span className="text-[11px] text-[#f9c74f]/90 bg-[#241548] px-1.5 py-0.5 rounded border border-[#4b2f7e]">
                        {zodiac.emoji} {zodiac.sign}
                      </span>
                    )}
                    <span className="text-sm">✨ 🎁 🥳 🍰</span>
                    <span className="text-[#f47b5c] font-bold">
                      Drop them a like & wishes on their ID Card!
                    </span>
                    <span className="text-[#f9c74f] font-mono mx-2">★★★</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right Action Dock */}
        <div className="flex items-center gap-2 shrink-0 justify-end">
          {/* Confetti & Fanfare Trigger */}
          <button
            type="button"
            onClick={handleCelebrateClick}
            className="pixel-btn text-[11px] py-1! px-2.5! flex items-center gap-1.5"
            title="Launch celebration confetti cannon!"
          >
            <PartyPopper className="w-3.5 h-3.5 text-[#1a1030]" />
            <span>Celebrate!</span>
          </button>

          {/* View ID Card */}
          <button
            type="button"
            onClick={() => handleViewCard(primaryCelebrant)}
            className="px-2.5 py-1 bg-[#241548] hover:bg-[#351d65] text-[#f9c74f] hover:text-white border border-[#f9c74f]/60 text-[11px] font-mono font-bold rounded cursor-pointer transition-colors flex items-center gap-1"
            title="View Birthday Student's ID Card"
          >
            <Heart className="w-3.5 h-3.5 text-[#f47b5c] fill-[#f47b5c]" />
            <span className="hidden sm:inline">Wish Card</span>
          </button>

          {/* Minimize / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 text-[#a08fd4] hover:text-white transition-colors cursor-pointer"
            title="Minimize announcement"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* If test mode active, button to stop preview */}
          {testCelebrantIndex !== null && (
            <button
              type="button"
              onClick={() => setTestCelebrantIndex(null)}
              className="text-[10px] text-[#f47b5c] hover:underline font-mono"
              title="Close test preview"
            >
              (End Preview)
            </button>
          )}
        </div>
      </div>

      {/* Special Personal Birthday Ribbon if Logged-in User is Celebrating Today */}
      {isCurrentUserBirthday && (
        <div className="bg-[#f9c74f] text-[#1a1030] px-3 py-1 text-center font-mono text-xs font-bold flex items-center justify-center gap-2 border-t border-[#f4e6c8]">
          <Sparkles className="w-3.5 h-3.5 text-[#1a1030]" />
          <span>
            🌟 HAPPY BIRTHDAY, {currentUser?.name}! The entire IT Adda & NexusIT family celebrates you today! Have an incredible year ahead! 🎂🎈
          </span>
          <button
            type="button"
            onClick={handleCelebrateClick}
            className="underline ml-2 hover:text-[#4b2f7e] cursor-pointer"
          >
            (Pop More Confetti!)
          </button>
        </div>
      )}
    </aside>
  );
};
