import React, { useState, useRef } from 'react';
import { ThumbsUp, ThumbsDown, Sparkles, Heart, Flame, ShieldAlert, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../utils/soundEffects';

export interface InteractiveReactionPillProps {
  studentId: string;
  likes: number;
  dislikes?: number;
  likedBy?: string[];
  dislikedBy?: string[];
  variant?: 'cream' | 'dark' | 'neo' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  showDislikeCount?: boolean;
  className?: string;
  onReact?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
  char: string;
}

// Gentle synthetic audio feedback without any external assets
const playReactionSound = (type: 'like' | 'dislike') => {
  if (type === 'like') {
    soundEngine.playHeartLike();
  } else {
    soundEngine.playDislike();
  }
};

const triggerHaptic = (type: 'like' | 'dislike') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(type === 'like' ? [15, 30, 20] : [20]);
    } catch {
      // Ignore
    }
  }
};

export const InteractiveReactionPill: React.FC<InteractiveReactionPillProps> = ({
  studentId,
  likes,
  dislikes = 0,
  likedBy = [],
  dislikedBy = [],
  variant = 'cream',
  size = 'md',
  showDislikeCount = true,
  className = '',
  onReact,
}) => {
  const { currentUser, likeStudent, dislikeStudent, setIsRegisterModalOpen } = useApp();

  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingAlert, setFloatingAlert] = useState<{
    text: string;
    type: 'like' | 'dislike' | 'info';
    subtext?: string;
  } | null>(null);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isDislikeAnimating, setIsDislikeAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [rippleWave, setRippleWave] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const hasLiked = currentUser ? likedBy?.includes(currentUser.id) : false;
  const hasDisliked = currentUser ? dislikedBy?.includes(currentUser.id) : false;

  const totalVotes = likes + dislikes;
  const approvalRate = totalVotes > 0 ? Math.round((likes / totalVotes) * 100) : 100;

  // Spawn visual particle burst
  const triggerParticles = () => {
    const chars = ['✨', '🔥', '⭐', '💛', '👏', '⚡', '🚀', '✦'];
    const colors = ['#F59E0B', '#F97316', '#EAB308', '#EF4444', '#EC4899', '#8B5CF6'];
    const newParticles: Particle[] = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 80,
      y: -25 - Math.random() * 45,
      scale: 0.8 + Math.random() * 0.5,
      rotation: (Math.random() - 0.5) * 45,
      color: colors[i % colors.length],
      char: chars[i % chars.length],
    }));

    setParticles(newParticles);
    setRippleWave(true);
    setTimeout(() => setParticles([]), 900);
    setTimeout(() => setRippleWave(false), 600);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUser || currentUser.status !== 'APPROVED') {
      setFloatingAlert({ text: 'Sign in to endorse!', type: 'info', subtext: 'Registered peers only' });
      setTimeout(() => setFloatingAlert(null), 2200);
      setIsRegisterModalOpen(true);
      return;
    }

    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 600);

    const willLike = !hasLiked;
    playReactionSound('like');
    triggerHaptic('like');

    if (willLike) {
      triggerParticles();
      const praisePills = ['+1 Endorsed! 🔥', '+1 Peer Respect ⭐', 'Vibe Checked ✨', 'Credibility Boosted 🚀'];
      const randomPraise = praisePills[Math.floor(Math.random() * praisePills.length)];
      setFloatingAlert({ text: randomPraise, type: 'like' });
    } else {
      setFloatingAlert({ text: 'Endorsement removed', type: 'info' });
    }
    setTimeout(() => setFloatingAlert(null), 1500);

    likeStudent(studentId);
    if (onReact) onReact();
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUser || currentUser.status !== 'APPROVED') {
      setFloatingAlert({ text: 'Sign in to interact', type: 'info' });
      setTimeout(() => setFloatingAlert(null), 2000);
      setIsRegisterModalOpen(true);
      return;
    }

    setIsDislikeAnimating(true);
    setTimeout(() => setIsDislikeAnimating(false), 550);

    playReactionSound('dislike');
    triggerHaptic('dislike');

    const willDislike = !hasDisliked;
    if (willDislike) {
      setFloatingAlert({ text: 'Feedback registered 💬', type: 'dislike' });
    } else {
      setFloatingAlert({ text: 'Dislike removed', type: 'info' });
    }
    setTimeout(() => setFloatingAlert(null), 1400);

    dislikeStudent(studentId);
    if (onReact) onReact();
  };

  // ==========================================
  // 1. NEO-BRUTALIST VARIANT (For Gen-Z ID Card)
  // ==========================================
  if (variant === 'neo') {
    return (
      <div
        className={`relative inline-flex items-center gap-1.5 select-none font-mono ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Floating feedback alert */}
        {floatingAlert && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-3 py-1 bg-black text-[#FFE600] text-[11px] font-black uppercase tracking-wider rounded-md border-2 border-[#FFE600] shadow-[3px_3px_0px_#000] animate-reaction-float pointer-events-none">
            {floatingAlert.text}
          </div>
        )}

        {/* Particles */}
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute pointer-events-none text-sm z-50 transition-all duration-700 ease-out"
            style={{
              left: `calc(40% + ${p.x}px)`,
              top: `${p.y}px`,
              transform: `scale(${p.scale}) rotate(${p.rotation}deg)`,
              opacity: 0.95,
            }}
          >
            {p.char}
          </span>
        ))}

        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`group relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-black uppercase border-[2.5px] border-black transition-all cursor-pointer ${
            hasLiked
              ? 'bg-[#FFE600] text-black shadow-[3px_3px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFE600]/90 shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000]'
          } active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
          title={hasLiked ? 'Endorsed! Click to revoke' : 'Endorse student profile'}
        >
          <ThumbsUp
            className={`w-4 h-4 transition-transform ${isLikeAnimating ? 'animate-thumb-pop' : ''} ${
              hasLiked ? 'fill-black stroke-black' : 'stroke-[2.5] group-hover:scale-125'
            }`}
          />
          <span className="font-mono tracking-tight font-black text-sm">{likes}</span>
          <span className="text-[10px] font-black bg-black text-[#FFE600] px-1 py-0.2 rounded-xs">
            {hasLiked ? 'LIT 🔥' : 'VOUCH'}
          </span>
        </button>

        {/* Dislike Button */}
        <button
          onClick={handleDislike}
          className={`group flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-black border-[2.5px] border-black transition-all cursor-pointer ${
            hasDisliked
              ? 'bg-[#FB7185] text-black shadow-[3px_3px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FB7185]/80 shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000]'
          } active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
          title={hasDisliked ? 'Disliked. Click to revoke' : 'Dislike profile'}
        >
          <ThumbsDown
            className={`w-3.5 h-3.5 transition-transform ${isDislikeAnimating ? 'animate-dislike-drop' : ''} ${
              hasDisliked ? 'fill-black stroke-black' : 'stroke-[2.5] group-hover:scale-125'
            }`}
          />
          {showDislikeCount && dislikes > 0 && (
            <span className="font-mono text-[11px] font-bold">{dislikes}</span>
          )}
        </button>

        {/* Neo Tooltip */}
        {showTooltip && totalVotes > 0 && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black text-[#CCFF00] border-2 border-black rounded text-[10px] font-black whitespace-nowrap shadow-[2px_2px_0px_#000] z-40 pointer-events-none">
            {approvalRate}% POSITIVE RATIO ({totalVotes} VOTES)
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. DARK GLASS DOCK VARIANT (For StudentIdCardModal)
  // ==========================================
  if (variant === 'dark') {
    return (
      <div
        ref={containerRef}
        className={`relative inline-flex items-center p-1 rounded-2xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl border border-slate-700/80 shadow-[0_8px_30px_rgb(0,0,0,0.4)] select-none transition-all hover:border-amber-500/40 ${className}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Ambient Halo Glow */}
        {hasLiked && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-600/20 rounded-2xl blur-sm -z-10 animate-pulse" />
        )}

        {/* Floating feedback alert */}
        {floatingAlert && (
          <div
            className={`absolute -top-11 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl border shadow-2xl animate-reaction-float pointer-events-none ${
              floatingAlert.type === 'like'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-300/50 shadow-amber-500/30'
                : floatingAlert.type === 'dislike'
                ? 'bg-rose-500/90 text-white border-rose-300/40 shadow-rose-500/30'
                : 'bg-slate-800/95 text-slate-200 border-slate-600 shadow-black/50'
            }`}
          >
            <span>{floatingAlert.text}</span>
          </div>
        )}

        {/* Particles */}
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute pointer-events-none text-sm z-50"
            style={{
              left: `calc(40% + ${p.x}px)`,
              top: `${p.y}px`,
              animation: 'reactionFloatUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {p.char}
          </span>
        ))}

        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`group relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
            hasLiked
              ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)] ring-1 ring-amber-300/60'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/90 hover:shadow-inner'
          }`}
          title={hasLiked ? 'Endorsement active! Click to revoke' : 'Endorse student (+1)'}
        >
          <div className="relative">
            <ThumbsUp
              className={`w-4 h-4 transition-all duration-300 ${
                isLikeAnimating ? 'animate-thumb-pop' : ''
              } ${
                hasLiked
                  ? 'fill-white stroke-white scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]'
                  : 'stroke-slate-300 group-hover:scale-120 group-hover:stroke-amber-300'
              }`}
            />
            {hasLiked && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            )}
          </div>

          <span className="tabular-nums font-mono font-black text-sm tracking-tight">{likes}</span>

          <span className="text-[11px] font-medium opacity-90 hidden sm:inline">
            {likes === 1 ? 'Endorsement' : 'Endorsements'}
          </span>

          {hasLiked && (
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold text-amber-100 hidden sm:inline">
              Active ⭐
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-[1px] h-5 bg-slate-700/80 mx-1" />

        {/* Dislike Button */}
        <button
          onClick={handleDislike}
          className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 ${
            hasDisliked
              ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/80'
          }`}
          title={hasDisliked ? 'Dislike active. Click to revoke.' : 'Dislike profile'}
        >
          <ThumbsDown
            className={`w-3.5 h-3.5 transition-all duration-300 ${
              isDislikeAnimating ? 'animate-dislike-drop' : ''
            } ${
              hasDisliked
                ? 'fill-rose-400 stroke-rose-400 scale-110'
                : 'stroke-slate-400 group-hover:scale-120 group-hover:stroke-rose-300'
            }`}
          />
          {showDislikeCount && dislikes > 0 && (
            <span className="tabular-nums font-mono text-xs font-bold text-rose-300/90">{dislikes}</span>
          )}
        </button>

        {/* Subtle Approval Rate Tooltip on Hover */}
        {showTooltip && totalVotes > 0 && (
          <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-950/95 border border-slate-700/80 rounded-lg text-[11px] text-slate-300 whitespace-nowrap shadow-2xl z-40 pointer-events-none flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-amber-400">{approvalRate}%</span> peer approval ({totalVotes} total votes)
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 3. EDITORIAL CREAM VARIANT (BrowseMembers & Directory)
  // ==========================================
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div
      ref={containerRef}
      className={`group/dock relative inline-flex items-center p-1 bg-[#150c28] border-2 border-[#4b2f7e] shadow-[2px_2px_0_#060410] select-none font-mono transition-all duration-200 hover:border-[#ff9844] ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Dynamic Ripple Wave on Like */}
      {rippleWave && (
        <span className="absolute inset-0 bg-[#ff9844]/20 animate-ping pointer-events-none" />
      )}

      {/* Floating feedback alert */}
      {floatingAlert && (
        <div
          className={`absolute -top-10 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-3 py-1 text-xs font-bold border-2 shadow-[2px_2px_0_#060410] animate-reaction-float pointer-events-none ${
            floatingAlert.type === 'like'
              ? 'bg-[#ff9844] text-[#060410] border-[#f4e6c8]'
              : floatingAlert.type === 'dislike'
              ? 'bg-[#c72d56] text-white border-[#f4e6c8]'
              : 'bg-[#150c28] text-[#f4e6c8] border-[#4b2f7e]'
          }`}
        >
          <span>{floatingAlert.text}</span>
        </div>
      )}

      {/* Floating particles on endorsement */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute pointer-events-none text-xs z-50 transition-all duration-700 ease-out"
          style={{
            left: `calc(35% + ${p.x}px)`,
            top: `${p.y}px`,
            transform: `scale(${p.scale}) rotate(${p.rotation}deg)`,
            opacity: 0.95,
          }}
        >
          {p.char}
        </span>
      ))}

      {/* Like / Endorse Button */}
      <button
        onClick={handleLike}
        className={`group relative flex items-center gap-1.5 ${
          isSm ? 'px-2 py-1 text-[11px]' : isLg ? 'px-4 py-2 text-xs' : 'px-3 py-1.5 text-xs'
        } font-bold transition-all duration-200 cursor-pointer active:translate-x-[1px] active:translate-y-[1px] border-2 ${
          hasLiked
            ? 'bg-[#ff9844] text-[#060410] border-[#f4e6c8] shadow-[2px_2px_0_#060410]'
            : 'bg-[#241344] hover:bg-[#341b5e] text-[#f4e6c8] border-[#4b2f7e] hover:border-[#ff9844]'
        }`}
        title={hasLiked ? 'Endorsed! Click to revoke' : 'Endorse student profile (+1)'}
      >
        <div className="relative">
          <ThumbsUp
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isLikeAnimating ? 'animate-thumb-pop' : ''
            } ${
              hasLiked
                ? 'fill-[#060410] stroke-[#060410]'
                : 'text-[#e2a87a] group-hover:text-[#ff9844] group-hover:scale-120'
            }`}
          />
          {hasLiked && (
            <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f4e6c8] opacity-80"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f4e6c8]"></span>
            </span>
          )}
        </div>

        <span className="tabular-nums font-mono font-black tracking-tight">{likes}</span>

        {!isSm && (
          <span className={`text-[10px] font-bold tracking-wider uppercase ${hasLiked ? 'text-[#060410]' : 'text-[#c8a8d8] group-hover:text-[#ff9844]'}`}>
            {hasLiked ? 'Vouched' : 'Endorse'}
          </span>
        )}
      </button>

      {/* Subtle Micro Divider */}
      <div className="w-[2px] h-4 bg-[#4b2f7e] mx-1" />

      {/* Dislike Button */}
      <button
        onClick={handleDislike}
        className={`group flex items-center gap-1 ${
          isSm ? 'p-1 text-[11px]' : isLg ? 'px-2 py-2 text-xs' : 'px-2 py-1.5 text-xs'
        } font-bold transition-all duration-200 cursor-pointer active:translate-x-[1px] active:translate-y-[1px] border-2 ${
          hasDisliked
            ? 'bg-[#c72d56] text-white border-[#f4e6c8] shadow-[2px_2px_0_#060410]'
            : 'bg-[#241344] hover:bg-[#341b5e] text-[#c8a8d8] hover:text-[#f4e6c8] border-[#4b2f7e]'
        }`}
        title={hasDisliked ? 'Disliked. Click to revoke' : 'Dislike profile'}
      >
        <ThumbsDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isDislikeAnimating ? 'animate-dislike-drop' : ''
          } ${
            hasDisliked
              ? 'fill-white stroke-white scale-110'
              : 'text-[#a05282] group-hover:text-[#c72d56] group-hover:scale-120'
          }`}
        />
        {showDislikeCount && dislikes > 0 && (
          <span className="tabular-nums font-mono text-[11px] font-bold text-[#f4e6c8] pl-0.5">
            {dislikes}
          </span>
        )}
      </button>

      {/* Approval percentage micro-bar on hover */}
      {showTooltip && totalVotes > 0 && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#060410] text-[#f4e6c8] text-[10px] font-bold tracking-wider whitespace-nowrap shadow-[2px_2px_0_#060410] z-40 pointer-events-none flex items-center gap-1 border-2 border-[#4b2f7e]">
          <span className="w-1.5 h-1.5 bg-[#ff9844]" />
          <span>
            <strong className="text-[#ff9844] font-bold">{approvalRate}%</strong> endorsement ({totalVotes} votes)
          </span>
        </div>
      )}
    </div>
  );
};
