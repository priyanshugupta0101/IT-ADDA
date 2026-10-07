import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StudentProfile, IdCardTheme, GenderType, BatchType } from '../types';
import { ID_CARD_THEMES } from '../utils/idCardThemes';
import { getBatchFromRoll } from '../utils/studentUtils';
import { GenZIdCard } from './GenZIdCard';
import { PhotoUploadField } from './PhotoUploadField';
import {
  ShieldCheck,
  User,
  Check,
  X,
  Sparkles,
  Layers,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  CreditCard,
  FileText,
  LogOut,
  Flame,
} from 'lucide-react';

export const PersonalDetailsModal: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    updateStudentProfile,
    isPersonalDetailsOpen,
    setIsPersonalDetailsOpen,
  } = useApp();

  // Core Identity Fields (now completely editable)
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState<number | string>('');
  const [division, setDivision] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState<GenderType>('Boys');
  const [batch, setBatch] = useState<BatchType>('BATCH_1');

  // Contact & Social Fields
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [description, setDescription] = useState('');
  const [techInterest, setTechInterest] = useState('');
  const [profileTag, setProfileTag] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [idCardTheme, setIdCardTheme] = useState<IdCardTheme>('spidey');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.42);
  const previewContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setRollNumber(currentUser.rollNumber ?? '');
      setDivision(currentUser.division || 'Div A (IT-1)');
      setBranch(currentUser.branch || 'Information Technology');
      setYear(currentUser.year || '1st Year');
      setGender(currentUser.gender || 'Boys');
      setBatch(currentUser.batch || getBatchFromRoll(currentUser.rollNumber));
      setPhone(currentUser.phoneNumber || '');
      setEmail(currentUser.email || '');
      setDescription(currentUser.description || '');
      setTechInterest(currentUser.techInterest || '');
      setProfileTag(currentUser.profileTag || '');
      setInstagramHandle(currentUser.instagramHandle || '');
      setLinkedinUrl(currentUser.linkedinUrl || '');
      setPhotoUrl(currentUser.photoUrl || '');
      setIdCardTheme(currentUser.idCardTheme || (currentUser.gender === 'Girls' ? 'barbie' : 'spidey'));
    }
  }, [currentUser, isPersonalDetailsOpen]);

  useEffect(() => {
    if (!isPersonalDetailsOpen) return;

    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerW = previewContainerRef.current.clientWidth;
        if (containerW > 0) {
          const s = Math.min((containerW - 20) / 960, 0.65);
          setPreviewScale(Math.max(s, 0.28));
        }
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isPersonalDetailsOpen]);

  if (!isPersonalDetailsOpen || !currentUser) return null;

  const handleRollNumberChange = (val: string) => {
    const num = parseInt(val, 10);
    setRollNumber(isNaN(num) ? val : num);
    if (!isNaN(num) && num > 0) {
      setBatch(getBatchFromRoll(num));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRoll = typeof rollNumber === 'number' ? rollNumber : parseInt(String(rollNumber), 10) || currentUser.rollNumber;
    const finalBatch = batch || getBatchFromRoll(finalRoll);

    const updates: Partial<StudentProfile> = {
      name: name.trim() || currentUser.name,
      rollNumber: finalRoll,
      division: division.trim() || currentUser.division,
      branch: branch.trim() || currentUser.branch,
      year: year.trim() || currentUser.year,
      gender,
      batch: finalBatch,
      phoneNumber: phone.trim(),
      email: email.trim() || currentUser.email,
      description: description.trim(),
      techInterest: techInterest.trim(),
      profileTag: profileTag.trim(),
      instagramHandle: instagramHandle.trim(),
      linkedinUrl: linkedinUrl.trim(),
      photoUrl: photoUrl.trim() || currentUser.photoUrl,
      idCardTheme,
    };

    if (newPassword.trim()) {
      updates.password = newPassword.trim();
    }

    updateStudentProfile(currentUser.id, updates);

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsPersonalDetailsOpen(false);
    }, 1500);
  };

  const previewStudent: StudentProfile = {
    ...currentUser,
    name: name || currentUser.name,
    rollNumber: typeof rollNumber === 'number' ? rollNumber : parseInt(String(rollNumber), 10) || currentUser.rollNumber,
    division: division || currentUser.division,
    branch: branch || currentUser.branch,
    year: year || currentUser.year,
    gender,
    batch,
    phoneNumber: phone || currentUser.phoneNumber,
    email: email || currentUser.email,
    profileTag: profileTag || currentUser.profileTag,
    description: description || currentUser.description,
    techInterest: techInterest || currentUser.techInterest,
    instagramHandle: instagramHandle || currentUser.instagramHandle,
    linkedinUrl: linkedinUrl || currentUser.linkedinUrl,
    photoUrl: photoUrl || currentUser.photoUrl,
    idCardTheme,
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#060410]/75 backdrop-blur-md flex flex-col items-center justify-start sm:justify-center p-3 sm:p-4 overflow-y-auto font-mono">
      <div className="w-full max-w-4xl bg-[#150c28]/75 backdrop-blur-2xl border-2 border-[#f4e6c8]/90 shadow-[8px_8px_0_rgba(6,4,16,0.7)] flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90dvh] relative my-auto overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-30 shrink-0 flex items-center justify-between border-b-2 border-[#4b2f7e]/80 bg-[#1a1030]/80 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-[#f4e6c8] bg-[#f47b5c] text-[#1a1030] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#060410]">
              <User className="w-5 h-5 text-[#1a1030]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">
                  Edit Profile & Digital ID Card
                </h3>
                <span className="px-2 py-0.5 bg-[#f47b5c]/20 border border-[#f47b5c]/50 text-[#f47b5c] text-[10px] font-bold font-mono flex items-center gap-1">
                  <Flame className="w-3 h-3 animate-pulse" />
                  <span>{currentUser.streak || 0}d Streak</span>
                </span>
              </div>
              <p className="text-xs text-[#a08fd4]">
                Customize your name, roll number, photo, bio, and style
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPersonalDetailsOpen(false)}
            className="text-[#a08fd4] hover:text-[#f4e6c8] p-1.5 border border-[#4b2f7e] hover:bg-[#241548] cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 bg-[#0e0822]/60 backdrop-blur-xl text-[#f4e6c8]">
          {saveSuccess ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 bg-[#241548] border-2 border-[#f4e6c8] text-[#f9c74f] flex items-center justify-center mx-auto shadow-[3px_3px_0_#060410]">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">
                Profile & ID Card Updated!
              </h4>
              <p className="text-xs text-[#a08fd4]">
                All changes to your name, credentials, and digital card have been saved across the portal.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {/* SECTION A: CARD THEME & LIVE PREVIEW */}
              <div className="p-5 border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl space-y-4 shadow-[4px_4px_0_rgba(6,4,16,0.65)]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#f9c74f]" />
                    <span className="text-xs font-bold text-[#f9c74f] uppercase tracking-wider">
                      Select ID Card Theme
                    </span>
                  </div>
                  <span className="text-xs text-[#a08fd4]">
                    Real-time preview rendered below
                  </span>
                </div>

                {/* Theme Options */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {(Object.keys(ID_CARD_THEMES) as IdCardTheme[]).map((tKey) => {
                    const t = ID_CARD_THEMES[tKey];
                    const isSelected = idCardTheme === tKey;
                    return (
                      <button
                        key={tKey}
                        type="button"
                        onClick={() => setIdCardTheme(tKey)}
                        className={`p-2.5 border-2 text-left flex flex-col justify-between transition-all cursor-pointer shadow-[2px_2px_0_#060410] ${
                          isSelected
                            ? 'bg-[#f9c74f] text-[#1a1030] border-[#f4e6c8] font-bold'
                            : 'bg-[#241548] text-[#b9a7e8] hover:bg-[#3a2170] hover:text-[#fff4d6] border-[#4b2f7e]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base">{t.emoji}</span>
                          <span
                            className="w-3.5 h-3.5 border border-black/30"
                            style={{ backgroundColor: t.accentColor }}
                          />
                        </div>
                        <div className="mt-2">
                          <span className="text-xs font-bold uppercase block">{t.name}</span>
                          <span className={`text-[10px] block truncate ${isSelected ? 'text-[#1a1030]/80' : 'text-[#a08fd4]'}`}>
                            {t.headerTitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Live Card Preview Box */}
                <div className="p-3 bg-[#0b0819] border-2 border-[#4b2f7e] overflow-hidden">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#4b2f7e] text-[11px] text-[#a08fd4]">
                    <div className="flex items-center gap-1.5 text-[#f9c74f] font-bold uppercase">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Live ID Card Preview (Updates Live with All Fields)</span>
                    </div>
                    <span>Crisp Vector ID</span>
                  </div>

                  <div
                    ref={previewContainerRef}
                    className="w-full flex items-center justify-center overflow-hidden py-2"
                  >
                    <div
                      style={{
                        width: `${960 * previewScale}px`,
                        height: `${570 * previewScale}px`,
                      }}
                      className="relative overflow-hidden shrink-0"
                    >
                      <div
                        style={{
                          width: 960,
                          height: 570,
                          transform: `scale(${previewScale})`,
                          transformOrigin: 'top left',
                        }}
                        className="shrink-0"
                      >
                        <GenZIdCard
                          student={previewStudent}
                          selectedTheme={idCardTheme}
                          showThemeBar={false}
                          showLikeShortcut={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: CORE IDENTITY & ACADEMIC CREDENTIALS */}
              <div className="p-5 border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl space-y-4 shadow-[4px_4px_0_rgba(6,4,16,0.65)]">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#4b2f7e]/70">
                  <GraduationCap className="w-4 h-4 text-[#f47b5c]" />
                  <span className="text-xs font-bold text-[#f9c74f] uppercase tracking-wider">
                    Core Student Information (Edit Anything)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Full Student Name <span className="text-[#f47b5c]">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Priyanshu Gupta"
                      className="w-full px-3.5 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>

                  {/* Roll Number */}
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Roll Number <span className="text-[#f47b5c]">*</span>
                    </label>
                    <input
                      type="number"
                      value={rollNumber}
                      onChange={(e) => handleRollNumberChange(e.target.value)}
                      min={1}
                      max={100}
                      required
                      className="w-full px-3.5 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Division */}
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Division
                    </label>
                    <input
                      type="text"
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      placeholder="Div A (IT-1)"
                      className="w-full px-3.5 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Branch / Department
                    </label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="Information Technology"
                      className="w-full px-3.5 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>

                  {/* Academic Year */}
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Academic Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    >
                      <option value="1st Year" className="bg-[#1a1030]">1st Year (FE)</option>
                      <option value="2nd Year" className="bg-[#1a1030]">2nd Year (SE)</option>
                      <option value="3rd Year" className="bg-[#1a1030]">3rd Year (TE)</option>
                      <option value="4th Year" className="bg-[#1a1030]">4th Year (BE)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Gender Group
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as GenderType)}
                      className="w-full px-3.5 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    >
                      <option value="Boys" className="bg-[#1a1030]">Boys</option>
                      <option value="Girls" className="bg-[#1a1030]">Girls</option>
                    </select>
                  </div>

                  {/* Batch */}
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Batch Assignment
                    </label>
                    <select
                      value={batch}
                      onChange={(e) => setBatch(e.target.value as BatchType)}
                      className="w-full px-3.5 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    >
                      <option value="BATCH_1" className="bg-[#1a1030]">Batch 1 (Roll 1 – 22)</option>
                      <option value="BATCH_2" className="bg-[#1a1030]">Batch 2 (Roll 23 – 43)</option>
                      <option value="BATCH_3" className="bg-[#1a1030]">Batch 3 (Roll 44 – 63)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION C: PHOTO UPLOAD */}
              <div className="p-5 border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl space-y-4 shadow-[4px_4px_0_rgba(6,4,16,0.65)]">
                <PhotoUploadField
                  value={photoUrl}
                  onChange={(newUrl) => setPhotoUrl(newUrl)}
                  label="Profile Photo (Choose file from device or image URL)"
                  helperText="Upload any personal photo or portrait from your device (JPG, PNG, WebP)"
                />
              </div>

              {/* SECTION D: BIO, TAGLINE & TECHNICAL SKILLS */}
              <div className="p-5 border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl space-y-4 shadow-[4px_4px_0_rgba(6,4,16,0.65)]">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#4b2f7e]/70">
                  <FileText className="w-4 h-4 text-[#f47b5c]" />
                  <span className="text-xs font-bold text-[#f9c74f] uppercase tracking-wider">
                    Bio, Skills & Headline
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    Headline / Profile Tag
                  </label>
                  <input
                    type="text"
                    value={profileTag}
                    onChange={(e) => setProfileTag(e.target.value)}
                    placeholder="e.g. Full-Stack Developer & Systems Architect"
                    className="w-full px-3.5 py-2 bg-[#1a1030]/80 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410] backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    Technical Skills & Frameworks (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={techInterest}
                    onChange={(e) => setTechInterest(e.target.value)}
                    placeholder="AI / ML, Next.js, Python, C++, Docker, Cloud"
                    className="w-full px-3.5 py-2 bg-[#1a1030]/80 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410] backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    About Me / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share a short bio for your ID card and directory card..."
                    className="w-full px-3.5 py-2 bg-[#1a1030]/80 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none leading-relaxed shadow-[2px_2px_0_#060410] backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* SECTION E: CREDENTIALS, SOCIAL & CONTACT */}
              <div className="p-5 border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl space-y-4 shadow-[4px_4px_0_rgba(6,4,16,0.65)]">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-[#4b2f7e]">
                  <CreditCard className="w-4 h-4 text-[#f47b5c]" />
                  <span className="text-xs font-bold text-[#f9c74f] uppercase tracking-wider">
                    Contact Details & Security
                  </span>
                </div>

                <div className="p-3 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs text-[#f9c74f] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#f47b5c] shrink-0" />
                  <span>Phone numbers remain confidential and are never shared publicly on the roster.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Private Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@engg.edu"
                      className="w-full px-3.5 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>
                </div>

                {/* Password Update Field */}
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 flex items-center justify-between uppercase">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#f47b5c]" />
                      <span>Change Account Password</span>
                    </span>
                    <span className="text-[10px] text-[#a08fd4] font-normal normal-case">Leave blank to keep existing password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (optional)"
                      className="w-full pl-3.5 pr-10 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a08fd4] hover:text-[#f4e6c8] cursor-pointer p-0.5"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="@username"
                      className="w-full px-3.5 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3.5 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer with Logout Option */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t-2 border-[#4b2f7e]">
                {/* Logout Option directly inside the Profile section */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUser(null);
                    localStorage.setItem('nexusit_portal_user_id_live', 'GUEST');
                    setIsPersonalDetailsOpen(false);
                  }}
                  className="pixel-btn-crimson text-xs flex items-center justify-center gap-1.5 py-2 px-3.5 cursor-pointer"
                  title="Logout from your student account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Profile</span>
                </button>

                {/* Cancel & Save Buttons */}
                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsPersonalDetailsOpen(false)}
                    className="pixel-btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="pixel-btn text-xs"
                  >
                    ▶ Save All Changes
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
