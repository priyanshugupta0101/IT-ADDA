import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GenderType } from '../types';
import { PhotoUploadField } from './PhotoUploadField';
import {
  UserPlus,
  AlertCircle,
  LogIn,
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Hash,
} from 'lucide-react';

interface RegisterModalProps {
  onOpenAdminPanel?: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ onOpenAdminPanel }) => {
  const {
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    registerStudent,
    loginStudent,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'REGISTER' | 'SIGNIN'>('REGISTER');
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [division, setDivision] = useState('Div A (IT-1)');
  const [branch, setBranch] = useState('Information Technology');
  const [profileTag, setProfileTag] = useState('Full-Stack Enthusiast');
  const [description, setDescription] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [techInterest, setTechInterest] = useState('');
  const [gender, setGender] = useState<GenderType>('Boys');
  const [photoUrl, setPhotoUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  if (!isRegisterModalOpen) return null;

  const handleClose = () => {
    setIsRegisterModalOpen(false);
    setFormError('');
    setSubmittedStatus(null);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const parsedRoll = parseInt(rollNumber, 10);
    if (isNaN(parsedRoll) || parsedRoll < 1 || parsedRoll > 63) {
      setFormError('Please enter a valid Roll Number between 1 and 63.');
      return;
    }

    if (!name.trim()) {
      setFormError('Full Name is required.');
      return;
    }

    if (!phoneNumber.trim()) {
      setFormError('Phone number is required. You will use it along with your password to log in.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setFormError('A valid college or personal email address is required.');
      return;
    }

    if (!password || password.trim().length < 4) {
      setFormError('Please enter a secure password with at least 4 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please verify both password fields.');
      return;
    }

    // Default portrait if no photo uploaded
    const finalPhoto =
      photoUrl.trim() ||
      (gender === 'Girls'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=95'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=95');

    setIsSubmitting(true);
    try {
      const res = await registerStudent({
        name: name.trim(),
        rollNumber: parsedRoll,
        division,
        branch,
        year: '1st Year (FE)',
        gender,
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        password: password.trim(),
        profileTag: profileTag.trim(),
        description: description.trim(),
        linkedinUrl: linkedinUrl.trim(),
        instagramHandle: instagramHandle.trim(),
        techInterest: techInterest.trim(),
        photoUrl: finalPhoto,
        role: 'STUDENT',
        idCardTheme: gender === 'Girls' ? 'barbie' : 'spidey',
      });

      if (!res.success) {
        setFormError(res.message);
      } else {
        setSubmittedStatus(res.message);
      }
    } catch (err: any) {
      console.error('Registration submission error:', err);
      setFormError(err?.message || 'Failed to submit registration. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!loginIdentifier.trim()) {
      setFormError('Please enter your registered Phone Number or Roll Number.');
      return;
    }

    if (!loginPassword.trim()) {
      setFormError('Please enter your account password.');
      return;
    }

    const res = loginStudent(loginIdentifier.trim(), loginPassword.trim());
    if (!res.success) {
      setFormError(res.message);
      return;
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060410]/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#1a1030]/75 backdrop-blur-2xl rounded-none sm:rounded-md border-2 border-[#f4e6c8]/90 shadow-[8px_8px_0_rgba(6,4,16,0.7)] overflow-hidden flex flex-col max-h-[92vh] my-auto font-mono text-white">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b-2 border-[#4b2f7e]/80 bg-[#150c28]/80 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border-2 border-[#f4e6c8] bg-[#f47b5c] text-[#1a1030] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#060410]">
              {activeTab === 'REGISTER' ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#f9c74f] tracking-wider uppercase font-mono">
                {activeTab === 'REGISTER' ? 'Student Registration' : 'Student Account Log In'}
              </h2>
              <p className="text-xs text-[#a08fd4] font-mono">
                IT Adda · 1st Year Information Technology Portal
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#a08fd4] hover:text-white p-1.5 border border-[#4b2f7e] hover:bg-[#241548] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-3 pb-2 bg-[#150c28]/70 backdrop-blur-md border-b-2 border-[#4b2f7e]/80">
          <div className="bg-[#1a1030]/80 p-1 flex items-center gap-1 border-2 border-[#4b2f7e]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('REGISTER');
                setSubmittedStatus(null);
                setFormError('');
              }}
              className={`flex-1 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'REGISTER'
                  ? 'bg-[#f9c74f] text-[#1a1030] border border-[#f4e6c8] shadow-xs'
                  : 'bg-[#241548] text-[#b9a7e8] hover:text-white'
              }`}
            >
              New Registration
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('SIGNIN');
                setSubmittedStatus(null);
                setFormError('');
              }}
              className={`flex-1 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'SIGNIN'
                  ? 'bg-[#f9c74f] text-[#1a1030] border border-[#f4e6c8] shadow-xs'
                  : 'bg-[#241548] text-[#b9a7e8] hover:text-white'
              }`}
            >
              Student Log In
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto flex-1 p-6 bg-[#0e0822]/65 backdrop-blur-xl text-[#f4e6c8]">
          {submittedStatus ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 bg-[#241548] border-2 border-[#f4e6c8] text-[#f9c74f] flex items-center justify-center mx-auto shadow-[3px_3px_0_#060410]">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-base font-bold uppercase tracking-wider text-[#f9c74f]">
                  Profile Submitted for Verification
                </h3>
                <p className="text-xs text-[#a08fd4] max-w-sm mx-auto mt-1 leading-relaxed">
                  Your registration has been forwarded to the Class Administrator for confirmation. Once approved, you can log in using your <strong>Phone Number or Roll Number</strong> with your chosen password.
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 pt-4">
                <button
                  onClick={handleClose}
                  className="pixel-btn text-xs py-2 px-6"
                >
                  Explore the Platform
                </button>
                <p className="text-[11px] text-[#f47b5c] font-mono tracking-wide">
                  Until admin approves your application
                </p>
              </div>
            </div>
          ) : activeTab === 'REGISTER' ? (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 font-mono">
              {formError && (
                <div className="p-3 bg-[#d34c53]/20 border-2 border-[#d34c53] text-[#fff4d6] text-xs font-mono font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#f47b5c]" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Direct Profile Photo File Upload */}
              <PhotoUploadField
                value={photoUrl}
                onChange={(newUrl) => setPhotoUrl(newUrl)}
                label="Profile Photo"
                helperText="Upload your portrait photo directly from device (JPG, PNG, WebP)"
              />

              {/* Name & Roll Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aryan Deshmukh"
                    required
                    className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    Roll Number (1–63) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="63"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. 15"
                    required
                    className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  />
                </div>
              </div>

              {/* Gender & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as GenderType)}
                    className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  >
                    <option value="Boys" className="bg-[#1a1030]">Boys (Male)</option>
                    <option value="Girls" className="bg-[#1a1030]">Girls (Female)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    Headline / Profile Tag *
                  </label>
                  <input
                    type="text"
                    value={profileTag}
                    onChange={(e) => setProfileTag(e.target.value)}
                    placeholder="e.g. Full-Stack Dev, ML Researcher"
                    required
                    className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    Phone Number (Login Identifier) *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 9823456789"
                    required
                    className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  />
                  <span className="text-[10px] text-[#a08fd4] mt-0.5 block">
                    Used to log in alongside your Roll Number
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    College Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    required
                    className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  />
                </div>
              </div>

              {/* Password Setup Section */}
              <div className="p-3.5 bg-[#150c28] border-2 border-[#4b2f7e] space-y-3 shadow-[2px_2px_0_#060410]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#f9c74f] uppercase tracking-wider">
                  <KeyRound className="w-4 h-4 text-[#f47b5c]" />
                  <span>Create Account Password *</span>
                </div>
                <p className="text-[11px] text-[#a08fd4] leading-normal">
                  Set the password you will use when logging in with your Phone Number or Roll Number.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#f4e6c8] mb-1 uppercase">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 4 characters"
                        required
                        className="w-full pl-3 pr-9 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a08fd4] hover:text-[#f4e6c8] cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#f4e6c8] mb-1 uppercase">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        className="w-full pl-3 pr-9 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a08fd4] hover:text-[#f4e6c8] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  />
                </div>
              </div>

              {/* Technical Skills */}
              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                  Skills / Tech Interests
                </label>
                <input
                  type="text"
                  value={techInterest}
                  onChange={(e) => setTechInterest(e.target.value)}
                  placeholder="Python, C++, Web Dev, IoT"
                  className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                  Bio / About Me
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share a few words about your interests..."
                  className="w-full px-3 py-2 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="pixel-btn-secondary text-xs disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="pixel-btn text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-3.5 h-3.5 border-2 border-[#1a1030] border-t-transparent animate-spin rounded-full" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>▶ Submit Registration</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* STUDENT LOG IN FORM - STRICT PHONE / ROLL NUMBER + PASSWORD ONLY */
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-[#d34c53]/20 border-2 border-[#d34c53] text-[#fff4d6] text-xs font-mono font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#f47b5c]" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="p-5 bg-[#150c28] border-2 border-[#4b2f7e] space-y-4 shadow-[4px_4px_0_rgba(6,4,16,0.7)]">
                <div className="border-b-2 border-[#4b2f7e] pb-3">
                  <h3 className="text-sm font-bold text-[#f9c74f] font-mono flex items-center gap-2 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-[#f47b5c]" />
                    <span>Secure Student Authentication</span>
                  </h3>
                  <p className="text-xs text-[#a08fd4] mt-0.5 font-mono">
                    Log in using your registered Phone Number or Roll Number and your account password.
                  </p>
                </div>

                {/* Identifier: Phone Number or Roll Number Only */}
                <div>
                  <label className="block text-xs font-mono font-bold text-[#f4e6c8] mb-1.5 flex items-center justify-between">
                    <span>Phone Number or Roll Number *</span>
                    <span className="text-[10px] text-[#a08fd4] font-normal">Roll or Phone</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. 24 or 9823456789"
                      required
                      autoFocus
                      className="w-full pl-9 pr-3 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white placeholder:text-[#a08fd4]/70 font-mono text-xs focus:outline-none transition-colors"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a08fd4]">
                      <Hash className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <span className="text-[11px] text-[#a08fd4] mt-1 block font-mono">
                    Enter your roll number (e.g. <strong>24</strong> or <strong>24cs024</strong>) or registered phone.
                  </span>
                </div>

                {/* Password: Required */}
                <div>
                  <label className="block text-xs font-mono font-bold text-[#f4e6c8] mb-1.5 flex items-center justify-between">
                    <span>Account Password *</span>
                    <span className="text-[10px] text-[#a08fd4] font-normal">Password set at registration</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your account password"
                      required
                      className="w-full pl-9 pr-10 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white placeholder:text-[#a08fd4]/70 font-mono text-xs focus:outline-none transition-colors"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a08fd4]">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a08fd4] hover:text-white cursor-pointer p-0.5"
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="pixel-btn w-full text-xs font-mono font-bold"
                >
                  <LogIn className="w-4 h-4 text-[#1a1030]" />
                  <span>▶ Log In to Account</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-stone-500">
                  Don&apos;t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('REGISTER');
                      setFormError('');
                    }}
                    className="font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                  >
                    Register your profile
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
