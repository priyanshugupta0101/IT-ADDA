import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NoticeItem } from '../types';
import {
  Bell,
  Plus,
  Pin,
  ShieldCheck,
  AlertCircle,
  X,
  Calendar,
} from 'lucide-react';

const NOTICE_CATEGORIES: NoticeItem['category'][] = [
  'Exam Schedule',
  'Lab Submission',
  'College Event',
  'CR Announcement',
  'Academic',
  'Urgent',
];

interface NoticeSectionProps {
  onOpenAdminPanel?: () => void;
}

export const NoticeSection: React.FC<NoticeSectionProps> = ({ onOpenAdminPanel }) => {
  const { notices, postNotice, currentUser, setIsRegisterModalOpen } = useApp();

  const [isPostNoticeOpen, setIsPostNoticeOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoticeItem['category']>('Exam Schedule');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const approvedNotices = notices.filter((n) => n.status === 'APPROVED');
  const pendingNoticesCount = notices.filter((n) => n.status === 'PENDING_APPROVAL').length;

  const handleOpenPostNotice = () => {
    if (!currentUser || currentUser.status !== 'APPROVED') {
      setIsRegisterModalOpen(true);
      return;
    }
    setIsPostNoticeOpen(true);
  };

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    postNotice(title, content, category);
    setTitle('');
    setContent('');
    setIsPostNoticeOpen(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  return (
    <div className="w-full space-y-6 font-mono">
      {/* Toast Notification Box */}
      {showSuccessToast && (
        <div className="p-4 bg-[#150c28] border-2 border-[#f4e6c8] text-[#f4e6c8] text-xs font-mono flex items-center justify-between gap-3 shadow-[4px_4px_0_#060410]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#f9c74f] shrink-0" />
            <span className="font-bold">Notice submitted successfully! Broadcasted across devices and routed to Admin Queue for verification.</span>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="text-[#f9c74f] hover:text-white p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Admin Queue Alert Box */}
      {currentUser?.isAdmin && pendingNoticesCount > 0 && (
        <div className="p-4 bg-[#1a1030] border-2 border-[#f47b5c] flex items-center justify-between gap-3 shadow-[4px_4px_0_#060410]">
          <div className="flex items-center gap-2.5 text-xs text-[#f4e6c8] font-bold">
            <AlertCircle className="w-4 h-4 text-[#f47b5c] shrink-0" />
            <span>{pendingNoticesCount} bulletin(s) awaiting approval in the moderation queue</span>
          </div>
          {onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              className="pixel-btn-amber text-xs py-1 px-3"
            >
              ▶ Review Queue
            </button>
          )}
        </div>
      )}

      {/* Header Banner Card */}
      <div className="bg-[#150c28]/60 backdrop-blur-xl border-2 border-[#4b2f7e]/80 p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 border-2 border-[#f4e6c8] bg-[#f47b5c] text-[#1a1030] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#060410]">
            <Bell className="w-5 h-5 text-[#1a1030]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-[#f9c74f] font-mono">
              Department Bulletin Board
            </h2>
            <p className="text-xs text-[#a08fd4] font-mono">
              Official circulars, timetable notices & CR announcements · {approvedNotices.length} active notices
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenPostNotice}
          className="pixel-btn text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>▶ Post Notice</span>
        </button>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4 font-mono">
        {approvedNotices.map((notice) => {
          const isPinned = notice.pinned;

          const categoryStyle =
            notice.category === 'Urgent'
              ? 'bg-[#d34c53] text-white border-[#f4e6c8]'
              : notice.category === 'Exam Schedule'
              ? 'bg-[#f47b5c] text-[#1a1030] border-[#f4e6c8]'
              : notice.category === 'CR Announcement'
              ? 'bg-[#f9c74f] text-[#1a1030] border-[#f4e6c8]'
              : 'bg-[#241548]/70 text-[#b9a7e8] border-[#4b2f7e]/80';

          return (
            <div
              key={notice.id}
              className={`bg-[#150c28]/60 backdrop-blur-xl border-2 p-5 shadow-[4px_4px_0_rgba(6,4,16,0.65)] transition-all space-y-3 ${
                isPinned ? 'border-[#f9c74f] shadow-[5px_5px_0_#060410]' : 'border-[#4b2f7e]/80 hover:border-[#f9c74f]'
              }`}
            >
              {/* Header: Category + Pin + Date */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b-2 border-[#4b2f7e]">
                <div className="flex items-center gap-2 flex-wrap">
                  {isPinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[#f9c74f] text-[#1a1030] border border-[#f4e6c8]">
                      <Pin className="w-3 h-3 fill-[#1a1030] text-[#1a1030]" />
                      <span>PINNED OFFICIAL</span>
                    </span>
                  )}

                  <span className={`text-[10px] font-bold px-2 py-0.5 border ${categoryStyle}`}>
                    {notice.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#a08fd4]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(notice.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Title & Content */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide leading-snug">
                  {notice.title}
                </h3>
                <p className="text-xs text-[#f4e6c8] leading-relaxed mt-2 whitespace-pre-wrap">
                  {notice.content}
                </p>
              </div>

              {/* Footer Author Attribution */}
              <div className="pt-2 border-t-2 border-[#4b2f7e] flex items-center justify-between text-xs text-[#a08fd4]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px]">Published by</span>
                  <span className="font-bold text-white uppercase">{notice.postedBy.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#241548] text-[#f9c74f] border border-[#4b2f7e]">
                    {notice.postedBy.role === 'CR_BOYS' ? 'CR (Boys)' : notice.postedBy.role === 'CR_GIRLS' ? 'CR (Girls)' : 'Department'}
                  </span>
                </div>

                <span className="text-[11px] text-[#a08fd4] font-mono">
                  REF: NOT-{notice.id.slice(-4).toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}

        {approvedNotices.length === 0 && (
          <div className="bg-[#150c28]/60 backdrop-blur-xl border-2 border-[#4b2f7e]/80 p-12 text-center text-[#a08fd4] text-xs font-mono shadow-[4px_4px_0_rgba(6,4,16,0.65)]">
            No official bulletins posted yet. Click &quot;Post Notice&quot; above to submit an announcement.
          </div>
        )}
      </div>

      {/* Modal: Post New Notice */}
      {isPostNoticeOpen && (
        <div className="fixed inset-0 z-50 bg-[#060410]/80 backdrop-blur-md flex items-center justify-center p-4 font-mono">
          <div className="bg-[#150c28]/85 backdrop-blur-2xl border-2 border-[#f4e6c8] max-w-md w-full p-6 shadow-[8px_8px_0_#060410] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e]">
              <h3 className="text-sm font-bold text-[#f9c74f] uppercase tracking-wider">Publish Department Bulletin</h3>
              <button
                onClick={() => setIsPostNoticeOpen(false)}
                className="text-[#a08fd4] hover:text-[#f4e6c8] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Notice Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rescheduled Physics Lab Batch 2 on Friday"
                  required
                  className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NoticeItem['category'])}
                  className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] focus:border-[#f9c74f] outline-none"
                >
                  {NOTICE_CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#1a1030] text-[#f4e6c8]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Full Announcement Body</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Details of the announcement, timings, venue, or required materials..."
                  required
                  className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none"
                />
              </div>

              <div className="p-3 bg-[#1a1030] border-2 border-[#4b2f7e] text-[#a08fd4] text-[11px] leading-relaxed">
                ℹ️ Student posts are submitted to the class admin queue for verification before appearing live on the noticeboard. Admin broadcasts publish instantly.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostNoticeOpen(false)}
                  className="pixel-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pixel-btn text-xs"
                >
                  ▶ Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
