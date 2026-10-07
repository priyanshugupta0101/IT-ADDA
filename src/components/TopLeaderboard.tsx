import React from 'react';
import { useApp } from '../context/AppContext';
import { StudentProfile } from '../types';
import {
  Trophy,
  Heart,
  Flame,
  ChevronRight,
} from 'lucide-react';

interface TopLeaderboardProps {
  onSelectStudent: (student: StudentProfile) => void;
}

export const TopLeaderboard: React.FC<TopLeaderboardProps> = ({ onSelectStudent }) => {
  const { students, theme } = useApp();

  const isDark = theme === 'dark';
  const approvedStudents = students.filter((s) => s.status === 'APPROVED');
  const totalMembers = approvedStudents.length;

  const top10Students = [...approvedStudents]
    .filter((s) => (s.likes || 0) > 0)
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 10);

  return (
    <div className="w-full space-y-6 relative font-mono">
      {/* Centered Box: Total Number of Members (Centered at the top) */}
      <div className="flex justify-center w-full">
        <div
          className="border-2 border-[#f4e6c8]/85 bg-[#1a1030]/65 backdrop-blur-xl px-10 sm:px-14 py-5 shadow-[6px_6px_0_rgba(6,4,16,0.65)] text-center min-w-[280px]"
        >
          <p className="text-xs sm:text-sm font-mono font-bold tracking-wider text-[#f9c74f] uppercase">
            Total number of members
          </p>
          <p className="text-4xl sm:text-5xl font-black mt-1.5 font-mono text-white">
            {totalMembers}
          </p>
          <span className="text-[10px] text-[#f47b5c] uppercase tracking-widest font-mono block mt-1">
            ● VERIFIED DIRECTORY
          </span>
        </div>
      </div>

      {/* Single Unified Leaderboard: Top 10 Liked Profiles */}
      <div
        className="w-full backdrop-blur-xl border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 shadow-[6px_6px_0_rgba(6,4,16,0.65)] overflow-hidden"
      >
        {/* Leaderboard Header */}
        <div
          className="px-6 py-4 border-b-2 border-[#4b2f7e]/70 bg-[#1a1030]/70 backdrop-blur-md flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 border-2 border-[#f4e6c8] bg-[#f9c74f] text-[#1a1030] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#060410]">
              <Trophy className="w-5 h-5 text-[#1a1030] font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-wider uppercase font-mono text-[#f9c74f]">
                  Top 10 Most Liked Student Leaders
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f47b5c] text-[#1a1030] font-bold text-[10px] border border-[#f4e6c8]">
                  <Flame className="w-3 h-3 text-[#1a1030]" />
                  <span>AURA RANK</span>
                </span>
              </div>
              <p className="text-xs text-[#a08fd4] mt-0.5 font-mono">
                Department of Information Technology · Division A (2026–2027)
              </p>
            </div>
          </div>
        </div>

        {/* Column Guide Bar */}
        <div
          className="px-5 sm:px-6 py-2 border-b-2 border-[#4b2f7e]/70 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider font-mono bg-[#150c28]/65 backdrop-blur-md text-[#a08fd4]"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="w-8 sm:w-10 text-center">Rank</span>
            <span>Profile</span>
          </div>
          <div>
            <span className="text-right pr-2">No. of Likes</span>
          </div>
        </div>

        {/* Top 10 Profile Rows (Order: Rank -> DP -> Name -> No. of Likes) */}
        {top10Students.length > 0 ? (
          <div className="divide-y-2 divide-[#4b2f7e]/50">
            {top10Students.map((student, index) => {
              const rank = index + 1;
              const isRank1 = rank === 1;
              const isRank2 = rank === 2;
              const isRank3 = rank === 3;

              return (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className="group flex items-center justify-between px-4 sm:px-6 py-3.5 transition-colors cursor-pointer gap-2.5 sm:gap-4 hover:bg-[#241548]/70"
                  title={`Click to view ${student.name}'s Digital ID Card`}
                >
                  {/* Left Group: 1. Rank -> 2. DP -> 3. Name */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* 1. RANK */}
                    <div className="w-8 sm:w-10 text-center shrink-0 flex items-center justify-center font-mono">
                      {isRank1 ? (
                        <span className="w-8 h-8 bg-[#f9c74f] text-[#1a1030] border-2 border-[#f4e6c8] flex items-center justify-center font-bold text-xs shadow-[2px_2px_0_#060410]">
                          #1 👑
                        </span>
                      ) : isRank2 ? (
                        <span className="w-8 h-8 bg-[#e8e6df] text-[#1a1030] border-2 border-[#f4e6c8] flex items-center justify-center font-bold text-xs shadow-[2px_2px_0_#060410]">
                          #2 🥈
                        </span>
                      ) : isRank3 ? (
                        <span className="w-8 h-8 bg-[#f47b5c] text-[#1a1030] border-2 border-[#f4e6c8] flex items-center justify-center font-bold text-xs shadow-[2px_2px_0_#060410]">
                          #3 🥉
                        </span>
                      ) : (
                        <span className="w-8 h-8 bg-[#241548] text-[#b9a7e8] border border-[#4b2f7e] flex items-center justify-center font-bold text-xs">
                          #{rank}
                        </span>
                      )}
                    </div>

                    {/* 2. DP (Display Picture) */}
                    <div
                      className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-none overflow-hidden shrink-0 shadow-md group-hover:scale-105 transition-transform duration-200 border-2 ${
                        isRank1
                          ? 'border-[#f9c74f]'
                          : isRank2
                          ? 'border-[#e8e6df]'
                          : isRank3
                          ? 'border-[#f47b5c]'
                          : 'border-[#4b2f7e] bg-[#241548]'
                      }`}
                    >
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    {/* 3. NAME */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {(student.role === 'DEVELOPER_ADMIN' || student.isDeveloper) && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#f9c74f] text-[#1a1030] text-[9px] font-mono font-extrabold uppercase border border-[#f4e6c8]">
                            ⚡ DEVELOPER / ADMIN
                          </span>
                        )}
                        <span className="text-sm sm:text-base font-bold text-white group-hover:text-[#f9c74f] transition-colors truncate font-mono">
                          {student.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#241548] border border-[#4b2f7e] text-[#f9c74f] shrink-0">
                          Roll #{student.rollNumber}
                        </span>
                      </div>
                      <p className="text-[11px] truncate mt-0.5 text-[#a08fd4] font-mono">
                        {student.techInterest || student.profileTag || 'Information Technology Student'}
                      </p>
                    </div>
                  </div>

                  {/* 4. NO. OF LIKES */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className="flex items-center gap-1.5 px-3 py-1 bg-[#241548] border-2 border-[#4b2f7e] font-bold font-mono text-xs text-[#f47b5c] shadow-[2px_2px_0_#060410] whitespace-nowrap"
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#f47b5c] text-[#f47b5c] shrink-0" />
                      <span>{student.likes} {student.likes === 1 ? 'Like' : 'Likes'}</span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#a08fd4] group-hover:text-[#f9c74f] transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#150c28]">
            <Trophy className="w-10 h-10 text-[#a08fd4] mx-auto mb-3" />
            <h3 className="text-sm font-semibold font-mono text-white">
              No Liked Profiles Yet
            </h3>
            <p className="text-xs mt-1 max-w-sm mx-auto text-[#a08fd4] font-mono">
              Profiles with at least 1 like will appear on the Top 10 Leaderboard. Upvote your batchmates to rank them here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
