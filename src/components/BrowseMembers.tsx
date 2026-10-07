import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { sortAndFilterStudents } from '../utils/studentUtils';
import { StudentProfile } from '../types';
import { soundEngine } from '../utils/soundEffects';
import {
  Search,
  Users,
  X,
  UserPlus,
  Heart,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';

type FilterTab = 'ALL' | 'BATCH_1' | 'BATCH_2' | 'BATCH_3';

export const BrowseMembers: React.FC = () => {
  const { students, setViewingStudent, setIsRegisterModalOpen, likeStudent, dislikeStudent, currentUser } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [reactionAnimation, setReactionAnimation] = useState<{
    studentId: string;
    type: 'like' | 'dislike';
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredAndSorted = useMemo(() => {
    const list = sortAndFilterStudents(students, activeFilter);
    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        String(s.rollNumber).includes(query) ||
        s.profileTag.toLowerCase().includes(query) ||
        s.techInterest.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
    );
  }, [students, activeFilter, searchQuery]);

  const counts = useMemo(() => {
    const approved = students.filter((s) => s.status === 'APPROVED');
    return {
      all: approved.length,
      b1: approved.filter((s) => s.rollNumber >= 1 && s.rollNumber <= 22).length,
      b2: approved.filter((s) => s.rollNumber >= 23 && s.rollNumber <= 43).length,
      b3: approved.filter((s) => s.rollNumber >= 44 && s.rollNumber <= 63).length,
    };
  }, [students]);

  const handleOpenIdCard = (student: StudentProfile) => {
    setViewingStudent(student);
  };

  const handleQuickLike = (e: React.MouseEvent, student: StudentProfile) => {
    e.stopPropagation();
    if (!currentUser) {
      setIsRegisterModalOpen(true);
      return;
    }
    if (currentUser.id === student.id) {
      showToast('You cannot vote on your own profile!');
      return;
    }

    soundEngine.playHeartLike();
    setReactionAnimation({ studentId: student.id, type: 'like' });
    likeStudent(student.id);

    setTimeout(() => {
      setReactionAnimation(null);
    }, 900);
  };

  const handleQuickDislike = (e: React.MouseEvent, student: StudentProfile) => {
    e.stopPropagation();
    if (!currentUser) {
      setIsRegisterModalOpen(true);
      return;
    }
    if (currentUser.id === student.id) {
      showToast('You cannot vote on your own profile!');
      return;
    }

    soundEngine.playDislike();
    setReactionAnimation({ studentId: student.id, type: 'dislike' });
    dislikeStudent(student.id);

    setTimeout(() => {
      setReactionAnimation(null);
    }, 900);
  };

  return (
    <div className="w-full space-y-6 relative font-mono">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#150c28] text-[#f4e6c8] px-4 py-2.5 border-2 border-[#f4e6c8] shadow-[4px_4px_0_#060410] text-xs font-bold font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#f9c74f]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Filter Card (Pixel Panel) */}
      <div className="bg-[#150c28]/60 backdrop-blur-xl border-2 border-[#4b2f7e]/80 p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b-2 border-[#4b2f7e]/70">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 border-2 border-[#f4e6c8] bg-[#f47b5c] text-[#1a1030] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#060410]">
              <Users className="w-5 h-5 text-[#1a1030]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider font-mono text-[#f9c74f]">
                  Student Directory & Roster
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f47b5c] text-[#1a1030] text-[10px] font-bold border border-[#f4e6c8]">
                  <Sparkles className="w-3 h-3 text-[#1a1030]" />
                  <span>DIV A</span>
                </span>
              </div>
              <p className="text-xs text-[#a08fd4] font-mono mt-0.5">
                Information Technology (2026–2027) · {filteredAndSorted.length} Students Listed
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#a08fd4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, roll #, interest..."
              className="w-full pl-9 pr-9 py-2 bg-[#1a1030]/70 border-2 border-[#4b2f7e]/80 focus:border-[#f9c74f] text-xs text-[#f4e6c8] placeholder-[#a08fd4]/60 font-mono shadow-[2px_2px_0_#060410] outline-none backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a08fd4] hover:text-[#f4e6c8] p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Predefined Filter Tabs */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Tab 1: All Batches */}
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`p-3 border-2 text-left flex flex-col justify-between transition-all cursor-pointer shadow-[3px_3px_0_#060410] backdrop-blur-md ${
              activeFilter === 'ALL'
                ? 'bg-[#f9c74f] text-[#1a1030] border-[#f4e6c8] font-bold'
                : 'bg-[#241548]/60 text-[#b9a7e8] hover:bg-[#3a2170]/80 hover:text-[#fff4d6] border-[#4b2f7e]/80'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold uppercase tracking-wider">All Batches</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 border ${
                  activeFilter === 'ALL'
                    ? 'bg-[#1a1030] text-[#f9c74f] border-[#1a1030]'
                    : 'bg-[#150c28]/80 text-[#f9c74f] border-[#4b2f7e]'
                }`}
              >
                {counts.all}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono mt-1 ${
                activeFilter === 'ALL' ? 'text-[#1a1030]/80' : 'text-[#a08fd4]'
              }`}
            >
              Roll 1 – 63
            </span>
          </button>

          {/* Tab 2: Batch 1 */}
          <button
            onClick={() => setActiveFilter('BATCH_1')}
            className={`p-3 border-2 text-left flex flex-col justify-between transition-all cursor-pointer shadow-[3px_3px_0_#060410] backdrop-blur-md ${
              activeFilter === 'BATCH_1'
                ? 'bg-[#f9c74f] text-[#1a1030] border-[#f4e6c8] font-bold'
                : 'bg-[#241548]/60 text-[#b9a7e8] hover:bg-[#3a2170]/80 hover:text-[#fff4d6] border-[#4b2f7e]/80'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold uppercase tracking-wider">Batch 1</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 border ${
                  activeFilter === 'BATCH_1'
                    ? 'bg-[#1a1030] text-[#f9c74f] border-[#1a1030]'
                    : 'bg-[#150c28]/80 text-[#f9c74f] border-[#4b2f7e]'
                }`}
              >
                {counts.b1}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono mt-1 ${
                activeFilter === 'BATCH_1' ? 'text-[#1a1030]/80' : 'text-[#a08fd4]'
              }`}
            >
              Roll 1 – 22
            </span>
          </button>

          {/* Tab 3: Batch 2 */}
          <button
            onClick={() => setActiveFilter('BATCH_2')}
            className={`p-3 border-2 text-left flex flex-col justify-between transition-all cursor-pointer shadow-[3px_3px_0_#060410] backdrop-blur-md ${
              activeFilter === 'BATCH_2'
                ? 'bg-[#f9c74f] text-[#1a1030] border-[#f4e6c8] font-bold'
                : 'bg-[#241548]/60 text-[#b9a7e8] hover:bg-[#3a2170]/80 hover:text-[#fff4d6] border-[#4b2f7e]/80'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold uppercase tracking-wider">Batch 2</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 border ${
                  activeFilter === 'BATCH_2'
                    ? 'bg-[#1a1030] text-[#f9c74f] border-[#1a1030]'
                    : 'bg-[#150c28]/80 text-[#f9c74f] border-[#4b2f7e]'
                }`}
              >
                {counts.b2}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono mt-1 ${
                activeFilter === 'BATCH_2' ? 'text-[#1a1030]/80' : 'text-[#a08fd4]'
              }`}
            >
              Roll 23 – 43
            </span>
          </button>

          {/* Tab 4: Batch 3 */}
          <button
            onClick={() => setActiveFilter('BATCH_3')}
            className={`p-3 border-2 text-left flex flex-col justify-between transition-all cursor-pointer shadow-[3px_3px_0_#060410] backdrop-blur-md ${
              activeFilter === 'BATCH_3'
                ? 'bg-[#f9c74f] text-[#1a1030] border-[#f4e6c8] font-bold'
                : 'bg-[#241548]/60 text-[#b9a7e8] hover:bg-[#3a2170]/80 hover:text-[#fff4d6] border-[#4b2f7e]/80'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold uppercase tracking-wider">Batch 3</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 border ${
                  activeFilter === 'BATCH_3'
                    ? 'bg-[#1a1030] text-[#f9c74f] border-[#1a1030]'
                    : 'bg-[#150c28] text-[#f9c74f] border-[#4b2f7e]'
                }`}
              >
                {counts.b3}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono mt-1 ${
                activeFilter === 'BATCH_3' ? 'text-[#1a1030]/80' : 'text-[#a08fd4]'
              }`}
            >
              Roll 44 – 63
            </span>
          </button>
        </div>
      </div>

      {/* Grid of Student Cards (Fitted Pixel Terminal Cards) */}
      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4 md:gap-5">
          {filteredAndSorted.map((student) => {
            const hasLiked = Boolean(currentUser && student.likedBy?.includes(currentUser.id));
            const hasDisliked = Boolean(currentUser && student.dislikedBy?.includes(currentUser.id));
            const isReacting = reactionAnimation?.studentId === student.id;

            return (
              <div
                key={student.id}
                onClick={() => handleOpenIdCard(student)}
                className="group relative bg-[#150c28]/60 backdrop-blur-xl border-2 border-[#4b2f7e]/80 hover:border-[#f9c74f] shadow-[4px_4px_0_rgba(6,4,16,0.65)] transition-all cursor-pointer overflow-hidden flex flex-col hover:-translate-y-0.5"
                title={`Click to view ${student.name}'s ID Card`}
              >
                {/* Floating Reaction Animation */}
                {isReacting && (
                  <div className="absolute top-10 right-3 z-30 pointer-events-none font-bold text-xs animate-reaction-float whitespace-nowrap">
                    {reactionAnimation.type === 'like' ? (
                      <span className="text-[#1a1030] bg-[#f9c74f] px-2.5 py-0.5 border-2 border-[#f4e6c8] shadow-[2px_2px_0_#060410] font-mono flex items-center gap-1 font-bold">
                        <span>+1</span>
                        <span>❤️</span>
                      </span>
                    ) : (
                      <span className="text-white bg-[#d34c53] px-2.5 py-0.5 border-2 border-[#f4e6c8] shadow-[2px_2px_0_#060410] font-mono flex items-center gap-1 font-bold">
                        <span>-1</span>
                        <span>👎</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Window Title Bar */}
                <div className="w-full bg-[#1a1030]/75 backdrop-blur-md border-b-2 border-[#4b2f7e]/70 px-3 sm:px-4 py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#d34c53]" />
                    <span className="w-2 h-2 bg-[#f9c74f]" />
                    <span className="w-2 h-2 bg-[#f47b5c]" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#a08fd4] uppercase tracking-wider">
                    STUDENT // ID
                  </span>
                </div>

                {/* Window Body: DP, Name, Roll Number, Likes */}
                <div className="p-4 sm:p-5 flex flex-col items-center text-center flex-1 justify-between">
                  {/* Photo with pixel border */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 p-0.5 border-2 border-[#f4e6c8] bg-[#241548] shrink-0 mb-3 shadow-[2px_2px_0_#060410]">
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

                  {/* Name */}
                  <h4 className="text-xs sm:text-sm md:text-base font-bold text-white group-hover:text-[#f9c74f] transition-colors truncate max-w-full font-mono uppercase tracking-wide">
                    {student.name}
                  </h4>

                  {/* Profile tag / tech interest */}
                  <p className="text-[11px] text-[#a08fd4] truncate max-w-full mt-0.5 font-mono">
                    {student.techInterest || student.profileTag || 'First Year IT'}
                  </p>

                  {/* Bottom info row: Roll & Quick Like/Dislike buttons */}
                  <div className="w-full mt-3 pt-3 border-t-2 border-[#4b2f7e] flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-[#241548]/80 text-[#f9c74f] border border-[#4b2f7e] inline-block">
                        #{String(student.rollNumber).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Like button (Firing Pixel Matrix Style) */}
                      <button
                        onClick={(e) => handleQuickLike(e, student)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold font-mono uppercase transition-all cursor-pointer border-2 shadow-[2px_2px_0_#060410] active:translate-x-[1px] active:translate-y-[1px] ${
                          hasLiked
                            ? 'bg-[#f9c74f] text-[#1a1030] border-[#f4e6c8]'
                            : 'bg-[#241548]/80 text-[#f47b5c] hover:bg-[#f47b5c] hover:text-[#1a1030] border-[#4b2f7e] hover:border-[#f4e6c8]'
                        }`}
                        title={hasLiked ? 'You liked this profile · Click to undo' : 'Like profile'}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            hasLiked ? 'fill-[#1a1030] text-[#1a1030]' : 'fill-[#f47b5c] text-[#f47b5c]'
                          } ${
                            isReacting && reactionAnimation.type === 'like'
                              ? 'animate-heart-pulse'
                              : ''
                          }`}
                        />
                        <span>{student.likes}</span>
                      </button>

                      {/* Dislike button (Firing Pixel Matrix Style) */}
                      <button
                        onClick={(e) => handleQuickDislike(e, student)}
                        className={`inline-flex items-center p-1 text-xs font-bold font-mono transition-all cursor-pointer border-2 shadow-[2px_2px_0_#060410] active:translate-x-[1px] active:translate-y-[1px] ${
                          hasDisliked
                            ? 'bg-[#d34c53] text-white border-[#f4e6c8]'
                            : 'bg-[#241548]/80 text-[#a08fd4] hover:bg-[#3a2170] hover:text-white border-[#4b2f7e]'
                        }`}
                        title={hasDisliked ? 'You disliked this profile · Click to undo' : 'Dislike profile'}
                      >
                        <ThumbsDown
                          className={`w-3.5 h-3.5 ${
                            hasDisliked ? 'fill-white text-white' : 'text-current'
                          } ${
                            isReacting && reactionAnimation.type === 'dislike'
                              ? 'animate-dislike-drop'
                              : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#150c28]/90 border-2 border-[#4b2f7e] shadow-[6px_6px_0_rgba(6,4,16,0.8)]">
          <Users className="w-10 h-10 text-[#a08fd4] mx-auto mb-3" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">No students registered yet</h3>
          <p className="text-xs text-[#a08fd4] mt-1 max-w-sm mx-auto font-mono">
            Be the first to create your student profile and get your official digital smart ID card!
          </p>
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="pixel-btn mt-4 text-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register First Student</span>
          </button>
        </div>
      )}
    </div>
  );
};
