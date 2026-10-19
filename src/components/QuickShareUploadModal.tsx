import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PendingSharedMaterial, smartDeriveResourceMetadata, formatBytes } from '../utils/shareTargetService';
import { ResourceItem } from '../types';
import { soundEngine } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Share2,
  Upload,
  FileText,
  FileArchive,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  X,
  Smartphone,
  ExternalLink,
  HelpCircle,
  FileCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';

const CATEGORIES: ResourceItem['category'][] = [
  'Verified PYQ',
  'Formula Sheet',
  'Lab Manual',
  'Lecture Notes',
  'Reference Book',
  'Cheat Sheet',
];

const COMMON_SUBJECTS = [
  'Applied Mathematics',
  'Applied Physics',
  'Applied Chemistry',
  'Basic Electrical Engg (BEE)',
  'Engineering Mechanics',
  'Programming & Problem Solving',
  'Engineering Graphics',
  'Basic Electronics',
  'Environmental Studies',
  'General Studies',
];

interface QuickShareUploadModalProps {
  pendingMaterial: PendingSharedMaterial | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessUpload?: () => void;
}

export const QuickShareUploadModal: React.FC<QuickShareUploadModalProps> = ({
  pendingMaterial,
  isOpen,
  onClose,
  onSuccessUpload,
}) => {
  const { uploadResource, currentUser, setIsRegisterModalOpen } = useApp();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<ResourceItem['category']>('Verified PYQ');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('2.5 MB');
  const [fileType, setFileType] = useState<'pdf' | 'doc' | 'image' | 'zip'>('pdf');
  const [guestAuthorName, setGuestAuthorName] = useState('');
  const [guestRoll, setGuestRoll] = useState<number>(101);
  const [isUploading, setIsUploading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Sync state whenever pending material changes
  useEffect(() => {
    if (pendingMaterial) {
      setTitle(pendingMaterial.title || 'Academic Resource');
      setSubject(pendingMaterial.subject || 'General Studies');
      setCategory(pendingMaterial.category || 'Verified PYQ');
      setDescription(
        pendingMaterial.description ||
          `Shared directly to IT Adda for First Year IT students.`
      );
      setFileName(pendingMaterial.name || 'Shared_Resource.pdf');
      setFileSize(pendingMaterial.formattedSize || formatBytes(pendingMaterial.size));

      const lower = (pendingMaterial.name || '').toLowerCase();
      if (lower.endsWith('.zip') || lower.endsWith('.rar')) setFileType('zip');
      else if (lower.endsWith('.doc') || lower.endsWith('.docx')) setFileType('doc');
      else if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) setFileType('image');
      else setFileType('pdf');
    }
  }, [pendingMaterial]);

  if (!isOpen && !pendingMaterial) return null;

  const handleManualFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const meta = smartDeriveResourceMetadata(file.name);
      setFileName(file.name);
      setFileSize(formatBytes(file.size));
      setTitle(meta.title);
      setSubject(meta.subject);
      setCategory(meta.category);

      const lower = file.name.toLowerCase();
      if (lower.endsWith('.zip') || lower.endsWith('.rar')) setFileType('zip');
      else if (lower.endsWith('.doc') || lower.endsWith('.docx')) setFileType('doc');
      else if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) setFileType('image');
      else setFileType('pdf');

      soundEngine.playSuccess();
    }
  };

  const handleDirectUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsUploading(true);

    const authorProfile = currentUser || {
      id: `anon_${Date.now()}`,
      name: guestAuthorName.trim() || 'IT Adda Contributor',
      rollNumber: guestRoll || 101,
      role: 'Student Contributor',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    uploadResource({
      title: title.trim(),
      subject: subject.trim() || 'General Studies',
      category,
      description: description.trim() || 'Study material shared directly to IT Adda.',
      fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
      fileType,
      fileSize,
      fileUrl: '#',
      uploadedBy: {
        id: authorProfile.id,
        name: authorProfile.name,
        rollNumber: authorProfile.rollNumber,
        photoUrl: authorProfile.photoUrl,
        role: authorProfile.role,
      },
    });

    soundEngine.playSuccess();

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f9c74f', '#f47b5c', '#7b2cbf', '#52b788'],
      });
    } catch {}

    setTimeout(() => {
      setIsUploading(false);
      onClose();
      if (onSuccessUpload) onSuccessUpload();
    }, 400);
  };

  const getFileIcon = () => {
    switch (fileType) {
      case 'zip':
        return <FileArchive className="w-8 h-8 text-[#f9c74f]" />;
      case 'image':
        return <ImageIcon className="w-8 h-8 text-[#52b788]" />;
      case 'doc':
        return <FileText className="w-8 h-8 text-[#f47b5c]" />;
      default:
        return <FileCheck className="w-8 h-8 text-[#f47b5c]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060410]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-mono overflow-y-auto">
      <div className="bg-[#150c28]/95 backdrop-blur-2xl border-2 border-[#f4e6c8] max-w-lg w-full p-5 sm:p-7 shadow-[10px_10px_0_#060410] space-y-4 my-auto animate-in fade-in zoom-in-95">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#4b2f7e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#f9c74f] border-2 border-[#f4e6c8] text-[#1a1030] flex items-center justify-center shadow-[2px_2px_0_#060410]">
              <Share2 className="w-4 h-4 text-[#1a1030]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-[#f9c74f] uppercase tracking-wider">
                  Shared to IT Adda
                </h3>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#52b788]/20 text-[#52b788] border border-[#52b788]/50 uppercase">
                  Auto-Loaded
                </span>
              </div>
              <p className="text-[11px] text-[#a08fd4]">
                File received · Verify details and 1-tap upload
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#a08fd4] hover:text-[#f4e6c8] p-1.5 cursor-pointer hover:bg-[#241548] border border-transparent hover:border-[#4b2f7e] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Received File Card */}
        <div className="p-3.5 bg-[#241548]/80 border-2 border-[#f9c74f]/70 rounded-none shadow-[3px_3px_0_#060410] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 bg-[#1a1030] border-2 border-[#4b2f7e] flex items-center justify-center shrink-0">
              {getFileIcon()}
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-sm">
                {fileName || 'Academic_Notes.pdf'}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#a08fd4]">
                <span className="text-[#f9c74f] font-bold">{fileSize}</span>
                <span>·</span>
                <span className="uppercase text-[#f4e6c8]">{fileType}</span>
                <span>·</span>
                <span className="text-[#52b788] flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          </div>

          <label className="text-[11px] font-bold text-[#f47b5c] hover:text-[#f9c74f] cursor-pointer underline flex items-center gap-1 shrink-0 ml-auto">
            <RefreshCw className="w-3 h-3" />
            <span>Change File</span>
            <input
              type="file"
              onChange={handleManualFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Upload Details Form */}
        <form onSubmit={handleDirectUpload} className="space-y-3.5">
          {/* Resource Title */}
          <div>
            <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase flex items-center justify-between">
              <span>Resource Title</span>
              <span className="text-[10px] text-[#52b788] font-normal">Auto-derived</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Applied Mathematics Unit 2 PYQ Solutions (2025)"
              required
              className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none"
            />
          </div>

          {/* Subject & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                Subject
              </label>
              <input
                type="text"
                list="subject-suggestions"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Applied Physics"
                required
                className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none"
              />
              <datalist id="subject-suggestions">
                {COMMON_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceItem['category'])}
                className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] focus:border-[#f9c74f] outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#1a1030] text-[#f4e6c8]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
              Description / Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key units covered, year, professor name..."
              className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none"
            />
          </div>

          {/* Author attribution info */}
          {!currentUser ? (
            <div className="p-2.5 bg-[#1a1030]/90 border border-[#4b2f7e] space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#f4e6c8]">
                <span className="font-bold">Contributor Credit:</span>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="text-[#f9c74f] underline hover:text-white cursor-pointer"
                >
                  Log in with Profile
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={guestAuthorName}
                  onChange={(e) => setGuestAuthorName(e.target.value)}
                  placeholder="Your Name (Optional)"
                  className="w-full px-2 py-1 bg-[#241548] border border-[#4b2f7e] text-[11px] text-white outline-none"
                />
                <input
                  type="number"
                  value={guestRoll || ''}
                  onChange={(e) => setGuestRoll(Number(e.target.value))}
                  placeholder="Roll No"
                  className="w-full px-2 py-1 bg-[#241548] border border-[#4b2f7e] text-[11px] text-white outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#a08fd4] px-1">
              <span>Uploading as:</span>
              <span className="font-bold text-[#f9c74f]">{currentUser.name}</span>
              <span className="text-[10px] text-[#f47b5c]">#{currentUser.rollNumber}</span>
            </div>
          )}

          {/* 1-Tap Submit Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="submit"
              disabled={isUploading}
              className="pixel-btn w-full py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-[4px_4px_0_#060410] disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Uploading to IT Adda...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current text-[#1a1030]" />
                  <span>▶ 1-Tap Upload Material</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="pixel-btn-secondary w-full sm:w-auto text-xs py-2.5 px-4"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Share Guide Toggle */}
        <div className="pt-2 border-t border-[#4b2f7e]/60">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-[11px] text-[#a08fd4] hover:text-[#f9c74f] flex items-center gap-1.5 cursor-pointer font-mono"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#f47b5c]" />
            <span>How does sharing from WhatsApp / Files to IT Adda work?</span>
          </button>

          {showGuide && (
            <div className="mt-2.5 p-3 bg-[#1a1030] border border-[#4b2f7e] text-[11px] text-[#b9a7e8] space-y-2 animate-in fade-in">
              <p className="font-bold text-[#f9c74f]">
                📲 Direct Share Target Integration:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[#f4e6c8]">
                <li>Open any PDF or document in WhatsApp, Drive, or phone Files.</li>
                <li>Tap <strong>Share</strong> (or Send File).</li>
                <li>Choose <strong>IT Adda</strong> from your phone&apos;s share menu.</li>
                <li>IT Adda opens automatically right here with the file attached — just tap Upload!</li>
              </ol>
              <p className="text-[10px] text-[#a08fd4]">
                Tip: If IT Adda isn&apos;t in your phone&apos;s share sheet yet, tap &quot;Install App&quot; or &quot;Add to Home Screen&quot; in Chrome/Safari to enable system-level integration.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
