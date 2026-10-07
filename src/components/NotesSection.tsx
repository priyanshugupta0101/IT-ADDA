import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NoteRequest } from '../types';
import {
  FileText,
  Plus,
  Upload,
  CheckCircle2,
  Clock,
  Download,
  Paperclip,
  X,
  AlertCircle,
  Search,
} from 'lucide-react';

export const NotesSection: React.FC = () => {
  const { noteRequests, createNoteRequest, fulfillNoteRequest, currentUser, setIsRegisterModalOpen } = useApp();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedReqForFulfill, setSelectedReqForFulfill] = useState<NoteRequest | null>(null);

  // Search & Filter
  const [subjectSearch, setSubjectSearch] = useState('');

  // Form states - user can enter any custom subject name
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [urgency, setUrgency] = useState<'Normal' | 'High' | 'Exam Tomorrow'>('Normal');

  // Fulfillment states
  const [fulfillComment, setFulfillComment] = useState('');
  const [fulfillFileName, setFulfillFileName] = useState('');
  const [fulfillFileSize, setFulfillFileSize] = useState('2.4 MB');
  const [fulfillFileType, setFulfillFileType] = useState<'pdf' | 'image' | 'doc'>('pdf');
  const [downloadToast, setDownloadToast] = useState('');

  const handleOpenRequestModal = () => {
    if (!currentUser) {
      setIsRegisterModalOpen(true);
      return;
    }
    setSubject('');
    setTopic('');
    setIsRequestModalOpen(true);
  };

  const handleOpenFulfillModal = (req: NoteRequest) => {
    if (!currentUser) {
      setIsRegisterModalOpen(true);
      return;
    }
    setSelectedReqForFulfill(req);
    setFulfillComment('');
    setFulfillFileName('');
  };

  const submitNoteRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const finalSubject = subject.trim() || 'General Studies';
    createNoteRequest(
      `Notes on: ${topic.trim()}`,
      finalSubject,
      topic.trim(),
      urgency
    );
    setTopic('');
    setSubject('');
    setIsRequestModalOpen(false);
  };

  const submitFulfillment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForFulfill || !currentUser) return;

    fulfillNoteRequest(selectedReqForFulfill.id, {
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRoll: currentUser.rollNumber,
      authorPhoto: currentUser.photoUrl,
      comment: fulfillComment.trim() || 'Uploaded notes.',
      fileName: fulfillFileName.trim() || 'Notes.pdf',
      fileType: fulfillFileType,
      fileSize: fulfillFileSize,
      fileUrl: '#',
    });

    setFulfillComment('');
    setSelectedReqForFulfill(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFulfillFileName(file.name);
      setFulfillFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      if (file.type.includes('pdf')) setFulfillFileType('pdf');
      else if (file.type.includes('image')) setFulfillFileType('image');
      else setFulfillFileType('doc');
    }
  };

  const handleDownload = (filename: string) => {
    setDownloadToast(`Preparing download for ${filename}...`);
    setTimeout(() => setDownloadToast(''), 3000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg border border-slate-700">
          {downloadToast}
        </div>
      )}

      {/* Header Banner Card */}
      <div className="bg-[#150c28]/60 backdrop-blur-xl border-2 border-[#4b2f7e]/80 p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 border-2 border-[#f4e6c8] bg-[#f47b5c] text-[#1a1030] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#060410]">
            <FileText className="w-5 h-5 text-[#1a1030]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-[#f9c74f] font-mono">
              Class Notes Exchange
            </h2>
            <p className="text-xs text-[#a08fd4] font-mono">
              Request lecture notes, solve doubts & share peer study materials · {noteRequests.length} active threads
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenRequestModal}
          className="pixel-btn text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>▶ Ask for Notes</span>
        </button>
      </div>

      {/* Filter by Subject Name or Topic */}
      <div className="bg-[#150c28]/60 backdrop-blur-xl border-2 border-[#4b2f7e]/80 p-3 shadow-[4px_4px_0_rgba(6,4,16,0.65)] font-mono flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#a08fd4] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={subjectSearch}
            onChange={(e) => setSubjectSearch(e.target.value)}
            placeholder="Search or enter subject name to filter notes (e.g. Mathematics, Physics, C...)"
            className="w-full pl-9 pr-8 py-2 bg-[#1a1030]/70 border-2 border-[#4b2f7e]/80 focus:border-[#f9c74f] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 outline-none shadow-[2px_2px_0_#060410] backdrop-blur-md"
          />
          {subjectSearch && (
            <button
              type="button"
              onClick={() => setSubjectSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a08fd4] hover:text-[#f4e6c8] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Note Requests Feed */}
      <div className="space-y-4 font-mono">
        {noteRequests
          .filter((req) => {
            if (!subjectSearch.trim()) return true;
            const q = subjectSearch.toLowerCase().trim();
            return (
              req.subject.toLowerCase().includes(q) ||
              req.topic.toLowerCase().includes(q) ||
              req.requestedBy.name.toLowerCase().includes(q)
            );
          })
          .map((req) => {
          const isExamTomorrow = req.urgency === 'Exam Tomorrow';
          const isHigh = req.urgency === 'High';

          const urgencyBadge = isExamTomorrow ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[#d34c53] text-white border border-[#f4e6c8]">
              <AlertCircle className="w-3 h-3 text-white" />
              <span>EXAM TOMORROW</span>
            </span>
          ) : isHigh ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[#f47b5c] text-[#1a1030] border border-[#f4e6c8]">
              <Clock className="w-3 h-3 text-[#1a1030]" />
              <span>URGENT</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#241548]/70 backdrop-blur-md text-[#b9a7e8] border border-[#4b2f7e]/80">
              STANDARD
            </span>
          );

          return (
            <div
              key={req.id}
              className="bg-[#150c28]/60 backdrop-blur-xl border-2 border-[#4b2f7e]/80 p-5 shadow-[4px_4px_0_rgba(6,4,16,0.65)] space-y-3.5"
            >
              {/* Header: Urgency + Subject + Requester */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#4b2f7e]">
                <div className="flex items-center gap-2 flex-wrap">
                  {urgencyBadge}

                  <span className="text-xs font-bold px-2 py-0.5 bg-[#241548]/80 text-[#f9c74f] border border-[#4b2f7e]">
                    {req.subject}
                  </span>

                  {req.fulfilled && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[#f9c74f] text-[#1a1030] border border-[#f4e6c8]">
                      <CheckCircle2 className="w-3 h-3 text-[#1a1030]" />
                      <span>FULFILLED</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-[#a08fd4]">
                  <div className="w-5 h-5 border border-[#4b2f7e] bg-[#241548] overflow-hidden shrink-0">
                    <img
                      src={req.requestedBy.photoUrl}
                      alt={req.requestedBy.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-bold text-white uppercase">{req.requestedBy.name}</span>
                  <span className="text-[#f9c74f] font-mono text-[11px]">#{req.requestedBy.rollNumber}</span>
                </div>
              </div>

              {/* Title & Topic */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {req.topic}
                </h3>
              </div>

              {/* Fulfillments / Shared Files */}
              {req.fulfillments && req.fulfillments.length > 0 ? (
                <div className="pt-2 space-y-2.5">
                  <span className="text-xs font-bold text-[#f9c74f] uppercase tracking-wider block">
                    Available Notes & Solutions ({req.fulfillments.length})
                  </span>

                  <div className="space-y-2">
                    {req.fulfillments.map((ful) => (
                      <div
                        key={ful.id}
                        className="bg-[#1a1030]/65 backdrop-blur-md border-2 border-[#4b2f7e]/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-[2px_2px_0_#060410]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 border border-[#f4e6c8] bg-[#f47b5c] text-[#1a1030] flex items-center justify-center shrink-0 font-bold">
                            <Paperclip className="w-4 h-4 text-[#1a1030]" />
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {ful.fileName || 'Handwritten Notes'}
                            </span>
                            <span className="text-[#a08fd4] text-[11px]">
                              Shared by {ful.authorName} (#{ful.authorRoll}) · {ful.fileSize || '1.8 MB'}
                            </span>
                            {ful.comment && (
                              <p className="text-[#f4e6c8] mt-0.5 text-[11px] italic">
                                &quot;{ful.comment}&quot;
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownload(ful.fileName || 'Notes.pdf')}
                          className="pixel-btn-secondary text-[11px] py-1 px-3 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Action: Help with Notes */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#a08fd4]">
                  {req.fulfillments?.length || 0} response(s) so far
                </span>

                <button
                  onClick={() => handleOpenFulfillModal(req)}
                  className="pixel-btn-amber text-xs py-1 px-3"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>▶ Upload Solution Notes</span>
                </button>
              </div>
            </div>
          );
        })}

        {noteRequests.length === 0 && (
          <div className="bg-[#150c28]/90 border-2 border-[#4b2f7e] p-12 text-center text-[#a08fd4] text-xs font-mono">
            No notes requests currently open. Click &quot;Ask for Notes&quot; to request notes for any subject!
          </div>
        )}
      </div>

      {/* Modal: Ask for Notes */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#060410]/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="bg-[#150c28] border-2 border-[#f4e6c8] max-w-md w-full p-6 shadow-[8px_8px_0_#060410] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e]">
              <h3 className="text-sm font-bold text-[#f9c74f] uppercase tracking-wider">Request Subject Notes</h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-[#a08fd4] hover:text-[#f4e6c8] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitNoteRequest} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject name (e.g. Engineering Mathematics, Python, Physics...)"
                  required
                  className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Topic / Chapter Name</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Unit 3 Double Integrals & Coordinate Systems"
                  required
                  className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Urgency</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] focus:border-[#f9c74f] outline-none"
                >
                  <option value="Normal" className="bg-[#1a1030]">Normal</option>
                  <option value="High" className="bg-[#1a1030]">High (Assignment Deadline)</option>
                  <option value="Exam Tomorrow" className="bg-[#1a1030]">Exam Tomorrow</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="pixel-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pixel-btn text-xs"
                >
                  ▶ Post Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Fulfill / Upload Notes */}
      {selectedReqForFulfill && (
        <div className="fixed inset-0 z-50 bg-[#060410]/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="bg-[#150c28] border-2 border-[#f4e6c8] max-w-md w-full p-6 shadow-[8px_8px_0_#060410] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e]">
              <h3 className="text-sm font-bold text-[#f9c74f] uppercase tracking-wider">Upload Notes for Batchmates</h3>
              <button
                onClick={() => setSelectedReqForFulfill(null)}
                className="text-[#a08fd4] hover:text-[#f4e6c8] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#1a1030] p-3 border-2 border-[#4b2f7e] text-xs">
              <span className="font-bold text-[#f47b5c] block text-[10px] uppercase">Fulfilling Request:</span>
              <span className="font-bold text-white">{selectedReqForFulfill.topic}</span>
              <span className="text-[#a08fd4] block text-[11px] mt-0.5">{selectedReqForFulfill.subject}</span>
            </div>

            <form onSubmit={submitFulfillment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Select File (PDF / Images / Docs)</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-[#a08fd4] file:mr-3 file:py-1.5 file:px-3 file:border-2 file:border-[#f4e6c8] file:text-xs file:font-mono file:font-bold file:bg-[#f47b5c] file:text-[#1a1030] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">File Title</label>
                <input
                  type="text"
                  value={fulfillFileName}
                  onChange={(e) => setFulfillFileName(e.target.value)}
                  placeholder="e.g. Maths_Unit3_Solved_Notes.pdf"
                  className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Note / Comment</label>
                <input
                  type="text"
                  value={fulfillComment}
                  onChange={(e) => setFulfillComment(e.target.value)}
                  placeholder="e.g. Includes professor handwritten steps and solved numericals"
                  className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReqForFulfill(null)}
                  className="pixel-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pixel-btn-gold text-xs"
                >
                  ▶ Share Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
