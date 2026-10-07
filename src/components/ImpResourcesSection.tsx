import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceItem } from '../types';
import {
  FolderArchive,
  Upload,
  Download,
  Search,
  X,
  BookOpen,
} from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'Verified PYQ',
  'Formula Sheet',
  'Lab Manual',
  'Lecture Notes',
  'Reference Book',
  'Cheat Sheet',
];

export const ImpResourcesSection: React.FC = () => {
  const { resources, uploadResource, currentUser, setIsRegisterModalOpen } = useApp();

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [downloadToast, setDownloadToast] = useState('');

  // Upload Form
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<ResourceItem['category']>('Verified PYQ');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('4.5 MB');

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchCat = activeCategory === 'ALL' || res.category === activeCategory;
      const matchSub =
        !subjectFilter.trim() ||
        res.subject.toLowerCase().includes(subjectFilter.toLowerCase().trim());
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        res.title.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q) ||
        res.subject.toLowerCase().includes(q);
      return matchCat && matchSub && matchSearch;
    });
  }, [resources, activeCategory, subjectFilter, searchQuery]);

  const handleOpenUpload = () => {
    if (!currentUser) {
      setIsRegisterModalOpen(true);
      return;
    }
    setSubject('');
    setIsUploadOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !title.trim()) return;

    const finalSubject = subject.trim() || 'General Studies';
    uploadResource({
      title: title.trim(),
      subject: finalSubject,
      category,
      description: description.trim() || 'Verified semester resource for First Year IT students.',
      fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
      fileType: fileName.endsWith('.zip') ? 'zip' : fileName.endsWith('.doc') || fileName.endsWith('.docx') ? 'doc' : 'pdf',
      fileSize,
      fileUrl: '#',
      uploadedBy: {
        id: currentUser.id,
        name: currentUser.name,
        rollNumber: currentUser.rollNumber,
        photoUrl: currentUser.photoUrl,
        role: currentUser.role,
      },
    });

    setIsUploadOpen(false);
    setTitle('');
    setSubject('');
    setDescription('');
    setFileName('');
  };

  const handleDownload = (filename: string) => {
    setDownloadToast(`Starting download: ${filename}`);
    setTimeout(() => setDownloadToast(''), 3000);
  };

  return (
    <div className="w-full space-y-6 font-mono">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-[#150c28] text-[#f4e6c8] text-xs font-bold font-mono border-2 border-[#f4e6c8] shadow-[4px_4px_0_#060410]">
          {downloadToast}
        </div>
      )}

      {/* Header Banner Card */}
      <div className="bg-[#150c28]/60 backdrop-blur-xl border-2 border-[#4b2f7e]/80 p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 border-2 border-[#f4e6c8] bg-[#f47b5c] text-[#1a1030] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#060410]">
            <FolderArchive className="w-5 h-5 text-[#1a1030]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-[#f9c74f] font-mono">
              Academic Resources & Study Vault
            </h2>
            <p className="text-xs text-[#a08fd4] font-mono">
              Verified previous year question papers, lecture slides, formula sheets & lab manuals
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenUpload}
          className="pixel-btn text-xs shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>▶ Upload Material</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[#150c28]/60 backdrop-blur-xl border-2 border-[#4b2f7e]/80 p-4 shadow-[4px_4px_0_rgba(6,4,16,0.65)] space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#a08fd4] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PYQ, formula sheets, topics..."
              className="w-full pl-9 pr-3.5 py-2 bg-[#1a1030]/70 border-2 border-[#4b2f7e]/80 focus:border-[#f9c74f] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 outline-none shadow-[2px_2px_0_#060410] backdrop-blur-md"
            />
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              placeholder="Filter by subject name..."
              className="w-full pl-3 pr-8 py-2 bg-[#1a1030]/70 border-2 border-[#4b2f7e]/80 focus:border-[#f9c74f] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 outline-none shadow-[2px_2px_0_#060410] backdrop-blur-md"
            />
            {subjectFilter && (
              <button
                type="button"
                onClick={() => setSubjectFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a08fd4] hover:text-[#f4e6c8] cursor-pointer"
                title="Clear subject filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 border-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-[2px_2px_0_#060410] ${
                  isSelected
                    ? 'bg-[#f9c74f] text-[#1a1030] border-[#f4e6c8]'
                    : 'bg-[#241548] text-[#b9a7e8] hover:bg-[#3a2170] hover:text-[#fff4d6] border-[#4b2f7e]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resources Cards Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-[#150c28]/60 backdrop-blur-xl border-2 border-[#4b2f7e]/80 hover:border-[#f9c74f] p-5 shadow-[4px_4px_0_rgba(6,4,16,0.65)] transition-all flex flex-col justify-between gap-4 group hover:-translate-y-0.5"
            >
              <div>
                {/* Header Category and File Type */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#241548]/80 text-[#f9c74f] border border-[#4b2f7e]">
                    {res.category}
                  </span>
                  <span className="text-[10px] font-mono text-[#a08fd4] uppercase font-bold">
                    {res.fileType.toUpperCase()} · {res.fileSize}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-[#f9c74f] transition-colors uppercase">
                  {res.title}
                </h3>
                <p className="text-xs text-[#f47b5c] font-bold mt-1 truncate">
                  {res.subject}
                </p>

                <p className="text-xs text-[#a08fd4] mt-2 line-clamp-2">
                  {res.description}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t-2 border-[#4b2f7e] flex items-center justify-between text-xs">
                <span className="text-[#a08fd4] text-[11px]">
                  Uploaded by {res.uploadedBy.name.split(' ')[0]}
                </span>

                <button
                  onClick={() => handleDownload(res.fileName)}
                  className="pixel-btn-secondary text-[11px] py-1 px-3 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#150c28]/60 backdrop-blur-xl border-2 border-[#4b2f7e]/80 shadow-[6px_6px_0_rgba(6,4,16,0.65)] font-mono">
          <BookOpen className="w-10 h-10 text-[#a08fd4] mx-auto mb-3" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">No resources found</h3>
          <p className="text-xs text-[#a08fd4] mt-1">
            {resources.length === 0
              ? 'Study vault is ready. Click "Upload Material" above to share the first PYQ or lecture notes.'
              : 'Try clearing your search or entering another subject or category filter.'}
          </p>
        </div>
      )}

      {/* Modal: Upload Resource */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-[#060410]/80 backdrop-blur-md flex items-center justify-center p-4 font-mono">
          <div className="bg-[#150c28]/85 backdrop-blur-2xl border-2 border-[#f4e6c8] max-w-md w-full p-6 shadow-[8px_8px_0_#060410] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e]">
              <h3 className="text-sm font-bold text-[#f9c74f] uppercase tracking-wider">Upload Academic Material</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-[#a08fd4] hover:text-[#f4e6c8] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Resource Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. End Semester Exam PYQ with Solution Key (2025)"
                  required
                  className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Subject Name</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter subject name (e.g. Mathematics, BEE, Physics...)"
                    required
                    className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ResourceItem['category'])}
                    className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] focus:border-[#f9c74f] outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'ALL').map((c) => (
                      <option key={c} value={c} className="bg-[#1a1030] text-[#f4e6c8]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Select File (PDF / DOC / ZIP)</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-[#a08fd4] file:mr-3 file:py-1.5 file:px-3 file:border-2 file:border-[#f4e6c8] file:text-xs file:font-mono file:font-bold file:bg-[#f47b5c] file:text-[#1a1030] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Brief Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key chapters covered, year of exam, prof name..."
                  className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="pixel-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pixel-btn text-xs"
                >
                  ▶ Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
