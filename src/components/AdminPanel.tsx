import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  StudentProfile,
  StudentRole,
  NoticeItem,
  ResourceItem,
  NoteRequest,
  CampusVibeOption,
  IdCardTheme,
  GenderType,
  BatchType,
} from '../types';
import { soundEngine } from '../utils/soundEffects';
import { getBatchFromRoll } from '../utils/studentUtils';
import { ID_CARD_THEMES } from '../utils/idCardThemes';
import { GenZIdCard } from './GenZIdCard';
import { PhotoUploadField } from './PhotoUploadField';
import {
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  Megaphone,
  Users,
  Search,
  Lock,
  Zap,
  FileCheck,
  AlertCircle,
  Check,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Download,
  FolderArchive,
  FileText,
  RefreshCw,
  Plus,
  Radio,
  X,
  CreditCard,
  UserPlus,
  CheckCheck,
  Upload,
  Pin,
  Paperclip,
  Send,
  BookOpen,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Heart,
  User,
  Key,
  Save,
  ExternalLink,
  Layers,
  GraduationCap,
  Mail,
  Instagram,
} from 'lucide-react';

const ROLE_OPTIONS: { role: StudentRole; label: string; group: string }[] = [
  { role: 'STUDENT', label: 'Regular IT Student', group: 'General' },
  { role: 'DEVELOPER_ADMIN', label: 'Developer / Admin (Full Access)', group: 'Lead' },
  { role: 'CR_BOYS', label: 'CR (Boys) - Class Representative', group: 'Class Representative' },
  { role: 'CR_GIRLS', label: 'CR (Girls) - Class Representative', group: 'Class Representative' },
  { role: 'BR1_BOYS', label: 'BR1 (Boys) - Batch 1 (Roll 1-22)', group: 'Batch Representative' },
  { role: 'BR1_GIRLS', label: 'BR1 (Girls) - Batch 1 (Roll 1-22)', group: 'Batch Representative' },
  { role: 'BR2_BOYS', label: 'BR2 (Boys) - Batch 2 (Roll 23-43)', group: 'Batch Representative' },
  { role: 'BR2_GIRLS', label: 'BR2 (Girls) - Batch 2 (Roll 23-43)', group: 'Batch Representative' },
  { role: 'BR3_BOYS', label: 'BR3 (Boys) - Batch 3 (Roll 44-63)', group: 'Batch Representative' },
  { role: 'BR3_GIRLS', label: 'BR3 (Girls) - Batch 3 (Roll 44-63)', group: 'Batch Representative' },
];

const ENGINEERING_SUBJECTS = [
  'Engineering Mathematics-1',
  'Basic Electrical & Electronics (BEE)',
  'Programming in C / Data Structures',
  'Engineering Physics',
  'Engineering Chemistry',
  'Engineering Mechanics',
  'Engineering Graphics & CAD',
  'Professional Communication',
  'Discrete Mathematics',
  'Object Oriented Programming',
];

export const AdminPanel: React.FC = () => {
  const {
    students,
    notices,
    resources,
    noteRequests,
    currentUser,
    approveStudent,
    dismissStudent,
    deleteStudent,
    updateStudentProfile,
    approveNotice,
    dismissNotice,
    deleteNotice,
    postNotice,
    uploadResource,
    deleteResource,
    uploadAdminNote,
    fulfillNoteRequest,
    deleteNoteRequest,
    registerDeveloperProfile,
    isAdminUnlocked,
    unlockAdmin,
    lockAdmin,
    adminCredentials,
    updateAdminCredentials,
    setCurrentUser,
    boostStudentLikes,
    setStudentLikes,
    setViewingStudent,
    exportDatabaseBackup,
    resetData,
    resetAllLikes,
    resetCampusVibePoll,
    theme,
    campusVibeConfig,
    updateCampusVibeConfig,
    developerFooterConfig,
    updateDeveloperFooterConfig,
  } = useApp();

  const isDark = theme === 'dark';

  // Check if a Developer / Admin profile is currently registered in the database
  const developerProfile = students.find(
    (s) => s.role === 'DEVELOPER_ADMIN' || (s.isAdmin && s.status === 'APPROVED')
  );
  const hasDevProfile = Boolean(developerProfile);

  // Admin Auth Gate State
  const [adminUserId, setAdminUserId] = useState('');
  const [adminAccessCode, setAdminAccessCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Admin Navigation
  const [activeAdminTab, setActiveAdminTab] = useState<
    'OVERVIEW' | 'MY_PROFILE' | 'NOTES' | 'RESOURCES' | 'ANNOUNCEMENTS' | 'NOTICES' | 'PROFILES' | 'ROSTER' | 'VIBE' | 'SETTINGS'
  >('OVERVIEW');

  const [selectedRoles, setSelectedRoles] = useState<Record<string, StudentRole>>({});
  const [rosterSearch, setRosterSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isResetting, setIsResetting] = useState<string | null>(null);
  const [confirmWipeActive, setConfirmWipeActive] = useState(false);

  // Footer / Developer Credits Editor State
  const [footerDevName, setFooterDevName] = useState(developerFooterConfig?.devName || 'Priyanshu Gupta');
  const [footerMessage, setFooterMessage] = useState(
    developerFooterConfig?.message || 'If you spot any bug or have some suggestions, connect with me'
  );
  const [footerEmail, setFooterEmail] = useState(developerFooterConfig?.email || 'guptapriyanshu0101@gmail.com');
  const [footerInstagram, setFooterInstagram] = useState(developerFooterConfig?.instagram || '@priyanshu_01928');
  const [footerSavedToast, setFooterSavedToast] = useState(false);

  // Keep in sync if config updates
  useEffect(() => {
    if (developerFooterConfig) {
      setFooterDevName(developerFooterConfig.devName || 'Priyanshu Gupta');
      setFooterMessage(developerFooterConfig.message || 'If you spot any bug or have some suggestions, connect with me');
      setFooterEmail(developerFooterConfig.email || 'guptapriyanshu0101@gmail.com');
      setFooterInstagram(developerFooterConfig.instagram || '@priyanshu_01928');
    }
  }, [developerFooterConfig]);

  // Admin Profile Editor State
  const [profName, setProfName] = useState(developerProfile?.name || currentUser?.name || 'Priyanshu Gupta');
  const [profRoll, setProfRoll] = useState<number | string>(developerProfile?.rollNumber ?? currentUser?.rollNumber ?? 24);
  const [profDivision, setProfDivision] = useState(developerProfile?.division || currentUser?.division || 'Div A (IT-1)');
  const [profBranch, setProfBranch] = useState(developerProfile?.branch || currentUser?.branch || 'Information Technology');
  const [profYear, setProfYear] = useState(developerProfile?.year || currentUser?.year || '1st Year (FE)');
  const [profGender, setProfGender] = useState<GenderType>(developerProfile?.gender || currentUser?.gender || 'Boys');
  const [profBatch, setProfBatch] = useState<BatchType>(developerProfile?.batch || currentUser?.batch || 'BATCH_2');
  const [profPhone, setProfPhone] = useState(developerProfile?.phoneNumber || currentUser?.phoneNumber || '');
  const [profEmail, setProfEmail] = useState(developerProfile?.email || currentUser?.email || 'codingtech928@gmail.com');
  const [profBio, setProfBio] = useState(developerProfile?.description || currentUser?.description || 'First Year Information Technology lead developer and administrator.');
  const [profTag, setProfTag] = useState(developerProfile?.profileTag || currentUser?.profileTag || 'Lead Engineer & Admin');
  const [profTech, setProfTech] = useState(developerProfile?.techInterest || currentUser?.techInterest || 'React, Node.js, Python, Cloud');
  const [profInsta, setProfInsta] = useState(developerProfile?.instagramHandle || currentUser?.instagramHandle || '');
  const [profLinkedIn, setProfLinkedIn] = useState(developerProfile?.linkedinUrl || currentUser?.linkedinUrl || '');
  const [profPhoto, setProfPhoto] = useState(developerProfile?.photoUrl || currentUser?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=95');
  const [profTheme, setProfTheme] = useState<IdCardTheme>(developerProfile?.idCardTheme || currentUser?.idCardTheme || 'spidey');
  const [profPassword, setProfPassword] = useState(developerProfile?.password || currentUser?.password || '1Q2W');
  const [showProfPassword, setShowProfPassword] = useState(false);
  const [isSavingProf, setIsSavingProf] = useState(false);

  // Synchronize with developerProfile or currentUser whenever changed
  useEffect(() => {
    const active = developerProfile || currentUser;
    if (active) {
      setProfName(active.name || '');
      setProfRoll(active.rollNumber ?? 24);
      setProfDivision(active.division || 'Div A (IT-1)');
      setProfBranch(active.branch || 'Information Technology');
      setProfYear(active.year || '1st Year (FE)');
      setProfGender(active.gender || 'Boys');
      setProfBatch(active.batch || getBatchFromRoll(active.rollNumber));
      setProfPhone(active.phoneNumber || '');
      setProfEmail(active.email || '');
      setProfBio(active.description || '');
      setProfTag(active.profileTag || '');
      setProfTech(active.techInterest || '');
      setProfInsta(active.instagramHandle || '');
      setProfLinkedIn(active.linkedinUrl || '');
      setProfPhoto(active.photoUrl || '');
      setProfTheme(active.idCardTheme || 'spidey');
      setProfPassword(active.password || '');
    }
  }, [developerProfile, currentUser]);

  // Admin Custom Credentials Settings State
  const [customUserField, setCustomUserField] = useState(adminCredentials.username);
  const [customPassField, setCustomPassField] = useState('');
  const [confirmPassField, setConfirmPassField] = useState('');
  const [showCredPass, setShowCredPass] = useState(false);
  const [isSavingCreds, setIsSavingCreds] = useState(false);
  const [credsMsg, setCredsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setCustomUserField(adminCredentials.username);
  }, [adminCredentials.username]);

  const handleRollChange = (val: string) => {
    const num = parseInt(val, 10);
    setProfRoll(isNaN(num) ? val : num);
    if (!isNaN(num) && num > 0) {
      setProfBatch(getBatchFromRoll(num));
    }
  };

  const liveAdminStudent: StudentProfile = {
    id: developerProfile?.id || currentUser?.id || 'std_dev_admin',
    name: profName.trim() || developerProfile?.name || currentUser?.name || 'Priyanshu Gupta',
    rollNumber: typeof profRoll === 'number' ? profRoll : parseInt(String(profRoll), 10) || 24,
    division: profDivision || 'Div A (IT-1)',
    branch: profBranch || 'Information Technology',
    year: profYear || '1st Year (FE)',
    gender: profGender || 'Boys',
    batch: profBatch || 'BATCH_2',
    phoneNumber: profPhone || '09004565878',
    email: profEmail || 'codingtech928@gmail.com',
    description: profBio || 'First Year Information Technology lead developer and administrator.',
    profileTag: profTag || 'Lead Engineer & Admin',
    techInterest: profTech || 'React, Node.js, Python, Cloud',
    instagramHandle: profInsta || '',
    linkedinUrl: profLinkedIn || '',
    photoUrl: profPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=95',
    idCardTheme: profTheme || 'spidey',
    password: profPassword || '1Q2W',
    role: 'DEVELOPER_ADMIN',
    status: 'APPROVED',
    likes: developerProfile?.likes || currentUser?.likes || 0,
    dislikes: 0,
    likedBy: developerProfile?.likedBy || currentUser?.likedBy || [],
    dislikedBy: [],
    createdAt: developerProfile?.createdAt || currentUser?.createdAt || new Date().toISOString(),
    isAdmin: true,
    isDeveloper: true,
  };

  const handleSaveAdminProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingProf(true);

    const finalRoll = typeof profRoll === 'number' ? profRoll : parseInt(String(profRoll), 10) || 24;
    const finalBatch = profBatch || getBatchFromRoll(finalRoll);

    if (!hasDevProfile) {
      const res = await registerDeveloperProfile({
        name: profName.trim() || 'Priyanshu Gupta',
        rollNumber: finalRoll,
        division: profDivision.trim() || 'Div A (IT-1)',
        branch: profBranch.trim() || 'Information Technology',
        year: profYear.trim() || '1st Year (FE)',
        gender: profGender,
        phoneNumber: profPhone.trim() || '09004565878',
        email: profEmail.trim() || 'codingtech928@gmail.com',
        description: profBio.trim(),
        profileTag: profTag.trim() || 'Lead Engineer & Admin',
        techInterest: profTech.trim() || 'React, Node.js, Python, Cloud',
        instagramHandle: profInsta.trim(),
        linkedinUrl: profLinkedIn.trim(),
        photoUrl: profPhoto.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=95',
        idCardTheme: profTheme,
        password: profPassword.trim() || '1Q2W',
      });
      showToast(res.message);
      setIsSavingProf(false);
      return;
    }

    const target = developerProfile || currentUser;
    if (!target) {
      setIsSavingProf(false);
      return;
    }

    const updates: Partial<StudentProfile> = {
      name: profName.trim() || target.name,
      rollNumber: finalRoll,
      division: profDivision.trim() || target.division,
      branch: profBranch.trim() || target.branch,
      year: profYear.trim() || target.year,
      gender: profGender,
      batch: finalBatch,
      phoneNumber: profPhone.trim(),
      email: profEmail.trim() || target.email,
      description: profBio.trim(),
      profileTag: profTag.trim(),
      techInterest: profTech.trim(),
      instagramHandle: profInsta.trim(),
      linkedinUrl: profLinkedIn.trim(),
      photoUrl: profPhoto.trim() || target.photoUrl,
      idCardTheme: profTheme,
    };

    if (profPassword.trim()) {
      updates.password = profPassword.trim();
    }

    updateStudentProfile(target.id, updates);
    setCurrentUser({
      ...target,
      ...updates,
    });

    soundEngine.playSuccess();
    showToast('Your admin profile & digital ID card were updated successfully!');
    setTimeout(() => setIsSavingProf(false), 400);
  };

  const handleSaveAdminCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredsMsg(null);
    if (!customUserField.trim()) {
      setCredsMsg({ type: 'error', text: 'Username cannot be empty.' });
      return;
    }
    if (!customPassField.trim()) {
      setCredsMsg({ type: 'error', text: 'Password cannot be empty.' });
      return;
    }
    if (confirmPassField && customPassField !== confirmPassField) {
      setCredsMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsSavingCreds(true);
    const res = await updateAdminCredentials(customUserField.trim(), customPassField.trim());
    setIsSavingCreds(false);

    if (res.success) {
      setCredsMsg({ type: 'success', text: res.message });
      showToast(res.message);
      setCustomPassField('');
      setConfirmPassField('');
    } else {
      setCredsMsg({ type: 'error', text: res.message });
    }
  };

  // --------------------------------------------------------------------------
  // CAMPUS VIBE MANAGEMENT STATE & HANDLERS
  // --------------------------------------------------------------------------
  const [vibeTitleInput, setVibeTitleInput] = useState(campusVibeConfig?.title || "Today's Campus Vibe");
  const [vibeSubtitleInput, setVibeSubtitleInput] = useState(campusVibeConfig?.subtitle || "Tap what describes your study mood today");
  const [newOptionTitle, setNewOptionTitle] = useState('');
  const [newOptionEmoji, setNewOptionEmoji] = useState('🔥');
  const [newOptionInitialCount, setNewOptionInitialCount] = useState(0);

  // Keep local inputs synchronized with context if remote SSE update occurs
  useEffect(() => {
    if (campusVibeConfig) {
      setVibeTitleInput(campusVibeConfig.title || "Today's Campus Vibe");
      setVibeSubtitleInput(campusVibeConfig.subtitle || "Tap what describes your study mood today");
    }
  }, [campusVibeConfig?.title, campusVibeConfig?.subtitle]);

  const handleSaveVibeTitle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!vibeTitleInput.trim()) return;
    await updateCampusVibeConfig({
      title: vibeTitleInput.trim(),
      subtitle: vibeSubtitleInput.trim(),
    });
    soundEngine.playSuccess();
    showToast("Campus Vibe section title & subtitle updated!");
  };

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionTitle.trim()) return;

    const newOption: CampusVibeOption = {
      id: `opt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      label: newOptionTitle.trim(),
      icon: newOptionEmoji.trim() || '⚡',
      count: Number(newOptionInitialCount) || 0,
    };

    const currentOptions = campusVibeConfig?.options || [];
    const updatedOptions = [...currentOptions, newOption];
    await updateCampusVibeConfig({ options: updatedOptions });
    soundEngine.playSuccess();
    showToast(`Added option "${newOptionTitle.trim()}" to Campus Vibe poll!`);
    setNewOptionTitle('');
    setNewOptionEmoji('🔥');
    setNewOptionInitialCount(0);
  };

  const handleRemoveOption = async (id: string, label: string) => {
    const currentOptions = campusVibeConfig?.options || [];
    if (currentOptions.length <= 1) {
      alert('The poll must have at least one option.');
      return;
    }
    const updatedOptions = currentOptions.filter((opt) => opt.id !== id);
    await updateCampusVibeConfig({ options: updatedOptions });
    soundEngine.playDelete();
    showToast(`Removed "${label}" from Campus Vibe options`);
  };

  const handleUpdateOption = async (id: string, updates: Partial<CampusVibeOption>) => {
    const currentOptions = campusVibeConfig?.options || [];
    const updatedOptions = currentOptions.map((opt) =>
      opt.id === id ? { ...opt, ...updates } : opt
    );
    await updateCampusVibeConfig({ options: updatedOptions });
  };

  const handleResetAllVotes = async () => {
    await resetCampusVibePoll();
    showToast('All Campus Vibe vote counts have been reset to 0!');
  };

  const handleApplyPreset = async (preset: { title: string; subtitle: string; options: CampusVibeOption[] }) => {
    setVibeTitleInput(preset.title);
    setVibeSubtitleInput(preset.subtitle);
    await updateCampusVibeConfig(preset);
    soundEngine.playSuccess();
    showToast(`Applied "${preset.title}" preset to Campus Vibe!`);
  };

  // --------------------------------------------------------------------------
  // 1. UPLOAD NOTES STATE
  // --------------------------------------------------------------------------
  const [noteSubject, setNoteSubject] = useState(ENGINEERING_SUBJECTS[0]);
  const [noteTopic, setNoteTopic] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteFileName, setNoteFileName] = useState('');
  const [noteFileSize, setNoteFileSize] = useState('2.8 MB');
  const [noteFileType, setNoteFileType] = useState<'pdf' | 'image' | 'doc'>('pdf');
  const [noteUrgency, setNoteUrgency] = useState<'Normal' | 'High' | 'Exam Tomorrow'>('Normal');
  const [noteAlsoResource, setNoteAlsoResource] = useState(true);
  const [fulfillingReq, setFulfillingReq] = useState<NoteRequest | null>(null);
  const [noteSuccessToast, setNoteSuccessToast] = useState('');

  // --------------------------------------------------------------------------
  // 2. UPLOAD RESOURCES STATE
  // --------------------------------------------------------------------------
  const [resTitle, setResTitle] = useState('');
  const [resSubject, setResSubject] = useState(ENGINEERING_SUBJECTS[0]);
  const [resCategory, setResCategory] = useState<ResourceItem['category']>('Verified PYQ');
  const [resDescription, setResDescription] = useState('');
  const [resFileName, setResFileName] = useState('');
  const [resFileSize, setResFileSize] = useState('3.5 MB');
  const [resFileType, setResFileType] = useState<'pdf' | 'doc' | 'image' | 'zip'>('pdf');
  const [resSearch, setResSearch] = useState('');
  const [resCategoryFilter, setResCategoryFilter] = useState('ALL');
  const [resSuccessToast, setResSuccessToast] = useState('');

  // --------------------------------------------------------------------------
  // 3. MAKE ANNOUNCEMENTS STATE
  // --------------------------------------------------------------------------
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementCategory, setAnnouncementCategory] = useState<NoticeItem['category']>('CR Announcement');
  const [announcementAudience, setAnnouncementAudience] = useState('All Batches (Roll 1-63)');
  const [announcementPinned, setAnnouncementPinned] = useState(true);
  const [announcementAuthor, setAnnouncementAuthor] = useState('Department Administrator (IT)');
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // --------------------------------------------------------------------------
  // 4. UPLOAD NOTICES STATE
  // --------------------------------------------------------------------------
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<NoticeItem['category']>('Academic');
  const [noticeAttachmentName, setNoticeAttachmentName] = useState('');
  const [noticeAttachmentSize, setNoticeAttachmentSize] = useState('1.4 MB');
  const [noticePinned, setNoticePinned] = useState(true);
  const [noticeAuthorTitle, setNoticeAuthorTitle] = useState('HOD & Administration Office');
  const [noticeSuccess, setNoticeSuccess] = useState(false);

  const pendingStudents = students.filter((s) => s.status === 'PENDING_APPROVAL');
  const pendingNotices = notices.filter((n) => n.status === 'PENDING_APPROVAL');
  const approvedStudents = students.filter((s) => s.status === 'APPROVED');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = unlockAdmin(adminUserId, adminAccessCode);
    if (!res.success) {
      setAuthError(res.message);
    } else {
      setAuthSuccessMsg(res.message);
    }
  };

  const handleApproveWithRole = (student: StudentProfile) => {
    const roleToAssign = selectedRoles[student.id] || 'STUDENT';
    approveStudent(student.id, roleToAssign);
    showToast(`Approved ${student.name} as ${roleToAssign}`);
  };

  const handleDismissPending = (student: StudentProfile) => {
    dismissStudent(student.id);
    showToast(`Dismissed registration for ${student.name}`);
  };

  const handleRejectDeletePending = (student: StudentProfile) => {
    deleteStudent(student.id);
    showToast(`Removed registration request for ${student.name}`);
  };

  const handleApproveAllPending = () => {
    pendingStudents.forEach((s) => {
      const role = selectedRoles[s.id] || 'STUDENT';
      approveStudent(s.id, role);
    });
    showToast(`Approved all ${pendingStudents.length} pending student accounts`);
  };

  const handleApplyLikesBoost = (studentId: string, amount: number) => {
    boostStudentLikes(studentId, amount);
    const target = students.find((s) => s.id === studentId);
    showToast(`+${amount} Likes added to ${target?.name || 'student'}`);
  };

  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateStudentProfile(editingStudent.id, {
      name: editingStudent.name,
      rollNumber: editingStudent.rollNumber,
      phoneNumber: editingStudent.phoneNumber,
      email: editingStudent.email,
      techInterest: editingStudent.techInterest,
      description: editingStudent.description,
      division: editingStudent.division,
      branch: editingStudent.branch,
      role: editingStudent.role,
      status: editingStudent.status,
    });
    showToast(`Saved changes for ${editingStudent.name}`);
    setEditingStudent(null);
  };

  // --------------------------------------------------------------------------
  // SUBMISSION HANDLERS: NOTES, RESOURCES, ANNOUNCEMENTS, NOTICES
  // --------------------------------------------------------------------------

  // 1. Submit Note Upload (or fulfill open request)
  const handleNoteUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTopic.trim()) return;

    if (fulfillingReq) {
      fulfillNoteRequest(fulfillingReq.id, {
        authorId: currentUser?.id || 'admin_itadda',
        authorName: currentUser?.name || 'Department Admin',
        authorRoll: currentUser?.rollNumber || 1,
        authorPhoto: currentUser?.photoUrl || '',
        comment: noteDescription.trim() || `Official verified notes for ${fulfillingReq.topic}.`,
        fileName: noteFileName.trim() || `${fulfillingReq.topic.replace(/\s+/g, '_')}_Notes.pdf`,
        fileType: noteFileType,
        fileSize: noteFileSize,
        fileUrl: '#',
      });
      showToast(`Fulfilled request for "${fulfillingReq.topic}" with notes!`);
      setFulfillingReq(null);
    } else {
      uploadAdminNote({
        title: `${noteSubject}: ${noteTopic.trim()}`,
        subject: noteSubject,
        topic: noteTopic.trim(),
        urgency: noteUrgency,
        comment: noteDescription.trim() || `Official lecture notes on ${noteTopic.trim()} for IT students.`,
        fileName: noteFileName.trim() || `${noteTopic.trim().replace(/\s+/g, '_')}_Notes.pdf`,
        fileSize: noteFileSize,
        fileType: noteFileType,
        alsoAddToResources: noteAlsoResource,
      });
      setNoteSuccessToast(`Notes on "${noteTopic.trim()}" published to Notes Exchange & Resources!`);
      setTimeout(() => setNoteSuccessToast(''), 4000);
      showToast('Study notes successfully uploaded and synced to all students!');
    }

    setNoteTopic('');
    setNoteDescription('');
    setNoteFileName('');
  };

  // 2. Submit Resource Upload
  const handleResourceUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;

    uploadResource({
      title: resTitle.trim(),
      subject: resSubject,
      category: resCategory,
      description: resDescription.trim() || `Verified ${resCategory} for First Year IT students.`,
      fileName: resFileName.trim() || `${resTitle.trim().replace(/\s+/g, '_')}.${resFileType === 'zip' ? 'zip' : 'pdf'}`,
      fileType: resFileType,
      fileSize: resFileSize,
      fileUrl: '#',
      uploadedBy: {
        id: currentUser?.id || 'admin_itadda',
        name: currentUser?.name || 'Department Administrator',
        rollNumber: currentUser?.rollNumber || 1,
        role: 'Verified Administrator',
        photoUrl: currentUser?.photoUrl,
      },
    });

    setResSuccessToast(`Resource "${resTitle.trim()}" added to Academic Library!`);
    setTimeout(() => setResSuccessToast(''), 4000);
    showToast('Resource uploaded and verified successfully!');

    setResTitle('');
    setResDescription('');
    setResFileName('');
  };

  // 3. Submit Announcement Broadcast
  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMsg.trim()) return;

    const formattedTitle = `[ANNOUNCEMENT - ${announcementAudience}] ${announcementTitle.trim()}`;
    postNotice(formattedTitle, announcementMsg.trim(), announcementCategory, {
      pinned: announcementPinned,
      authorName: announcementAuthor.trim() || 'Department Administrator',
      authorDesignation: 'Admin Broadcast',
    });

    setAnnouncementSuccess(true);
    showToast('Department announcement broadcasted in real-time to all devices!');
    setAnnouncementTitle('');
    setAnnouncementMsg('');
    setTimeout(() => setAnnouncementSuccess(false), 4000);
  };

  // 4. Submit Notice Upload
  const handleNoticeUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    postNotice(`[CIRCULAR] ${noticeTitle.trim()}`, noticeContent.trim(), noticeCategory, {
      pinned: noticePinned,
      authorName: noticeAuthorTitle.trim() || 'HOD & Admin Office',
      authorDesignation: 'Verified Circular',
      attachmentUrl: noticeAttachmentName ? '#' : undefined,
    });

    setNoticeSuccess(true);
    showToast('Official notice uploaded & published to noticeboard!');
    setNoticeTitle('');
    setNoticeContent('');
    setNoticeAttachmentName('');
    setTimeout(() => setNoticeSuccess(false), 4000);
  };

  // --------------------------------------------------------------------------
  // LOCKED GATE VIEW
  // --------------------------------------------------------------------------
  if (!isAdminUnlocked) {
    return (
      <div className="max-w-sm mx-auto my-14 sm:my-20 px-4">
        <div
          className="border-2 border-[#f4e6c8]/85 bg-[#1a1030]/65 backdrop-blur-xl shadow-[6px_6px_0_rgba(6,4,16,0.65)] p-6 sm:p-7"
        >
          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            {authError && (
              <div className="p-2.5 bg-[#d34c53]/20 border-2 border-[#d34c53] text-[#fff4d6] text-xs font-mono font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#f47b5c]" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <input
                type="text"
                value={adminUserId}
                onChange={(e) => {
                  setAdminUserId(e.target.value);
                  if (authError) setAuthError('');
                }}
                placeholder="Enter the username"
                required
                autoFocus
                className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white placeholder:text-[#a08fd4]/70 font-mono text-xs focus:outline-none transition-colors"
              />
            </div>

            <div>
              <input
                type="password"
                value={adminAccessCode}
                onChange={(e) => {
                  setAdminAccessCode(e.target.value);
                  if (authError) setAuthError('');
                }}
                placeholder="Enter the password"
                required
                className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white placeholder:text-[#a08fd4]/70 font-mono text-xs focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="pixel-btn w-full text-xs font-mono font-bold tracking-wider"
            >
              ▶ LOGIN
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // UNLOCKED VIEW
  // --------------------------------------------------------------------------
  return (
    <div className="w-full space-y-6">
      {/* Toast message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-[#150c28]/95 backdrop-blur-xl text-[#f4e6c8] text-xs font-mono font-bold shadow-[6px_6px_0_#060410] flex items-center gap-2 border-2 border-[#f4e6c8] animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#52b788] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="border-2 border-[#4b2f7e]/80 bg-[#1a1030]/65 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 border-2 border-[#f4e6c8] bg-[#f47b5c] text-[#1a1030] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#060410]">
            <ShieldCheck className="w-6 h-6 text-[#1a1030]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-[#f9c74f] tracking-wider uppercase font-mono">
                Department Administrative Center
              </h2>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-[#f9c74f] text-[#1a1030] border border-[#f4e6c8] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a1030] animate-pulse" />
                VERIFIED ADMIN // UNLOCKED
              </span>
            </div>
            <p className="text-xs text-[#a08fd4] mt-1 font-mono">
              Publish lecture notes, upload study materials, broadcast announcements & notices
            </p>
            {currentUser && (
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-[#a08fd4]">Admin Profile:</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold bg-[#241548]/80 text-[#f9c74f] border border-[#4b2f7e]">
                  <User className="w-3 h-3 text-[#f9c74f]" />
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] text-[#f47b5c] font-mono">#{currentUser.rollNumber}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveAdminTab('MY_PROFILE')}
                  className="text-xs font-bold text-[#f47b5c] hover:text-[#f9c74f] underline flex items-center gap-1 cursor-pointer font-mono"
                >
                  <span>Edit Profile & ID Card</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportDatabaseBackup}
            className="pixel-btn-secondary text-xs"
            title="Download complete JSON backup of the portal database"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={lockAdmin}
            className="pixel-btn-crimson text-xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Console</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-1.5 shadow-[4px_4px_0_rgba(6,4,16,0.65)] flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono">
        <button
          onClick={() => setActiveAdminTab('OVERVIEW')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors cursor-pointer select-none border ${
            activeAdminTab === 'OVERVIEW'
              ? 'bg-[#f9c74f] text-[#1a1030] font-bold border-[#f4e6c8] shadow-xs'
              : 'bg-[#241548]/70 text-[#b9a7e8] border-[#4b2f7e] hover:bg-[#3a2170] hover:text-[#fff4d6]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Overview</span>
        </button>

        {/* MY ADMIN PROFILE TAB */}
        <button
          onClick={() => setActiveAdminTab('MY_PROFILE')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors cursor-pointer select-none border ${
            activeAdminTab === 'MY_PROFILE'
              ? 'bg-[#f9c74f] text-[#1a1030] font-bold border-[#f4e6c8] shadow-xs'
              : 'bg-[#241548] text-[#b9a7e8] border-[#4b2f7e] hover:bg-[#3a2170] hover:text-[#fff4d6]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile & Card</span>
        </button>

        {/* 1. UPLOAD NOTES TAB */}
        <button
          onClick={() => setActiveAdminTab('NOTES')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors cursor-pointer select-none border ${
            activeAdminTab === 'NOTES'
              ? 'bg-[#f9c74f] text-[#1a1030] font-bold border-[#f4e6c8] shadow-xs'
              : 'bg-[#241548] text-[#b9a7e8] border-[#4b2f7e] hover:bg-[#3a2170] hover:text-[#fff4d6]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Upload Notes</span>
          {noteRequests.filter((r) => !r.fulfilled).length > 0 && (
            <span className="px-1.5 py-0.2 bg-[#d34c53] text-white text-[9px] font-bold border border-[#f4e6c8]">
              {noteRequests.filter((r) => !r.fulfilled).length}
            </span>
          )}
        </button>

        {/* 2. UPLOAD RESOURCES TAB */}
        <button
          onClick={() => setActiveAdminTab('RESOURCES')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors cursor-pointer select-none border ${
            activeAdminTab === 'RESOURCES'
              ? 'bg-[#f9c74f] text-[#1a1030] font-bold border-[#f4e6c8] shadow-xs'
              : 'bg-[#241548] text-[#b9a7e8] border-[#4b2f7e] hover:bg-[#3a2170] hover:text-[#fff4d6]'
          }`}
        >
          <FolderArchive className="w-4 h-4" />
          <span>Resources ({resources.length})</span>
        </button>

        {/* 3. MAKE ANNOUNCEMENTS TAB */}
        <button
          onClick={() => setActiveAdminTab('ANNOUNCEMENTS')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors cursor-pointer select-none border ${
            activeAdminTab === 'ANNOUNCEMENTS'
              ? 'bg-[#f9c74f] text-[#1a1030] font-bold border-[#f4e6c8] shadow-xs'
              : 'bg-[#241548] text-[#b9a7e8] border-[#4b2f7e] hover:bg-[#3a2170] hover:text-[#fff4d6]'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Announcements</span>
        </button>

        {/* 4. UPLOAD NOTICES TAB */}
        <button
          onClick={() => setActiveAdminTab('NOTICES')}
          className={`relative flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors cursor-pointer select-none border ${
            activeAdminTab === 'NOTICES'
              ? 'bg-[#f9c74f] text-[#1a1030] font-bold border-[#f4e6c8] shadow-xs'
              : 'bg-[#241548] text-[#b9a7e8] border-[#4b2f7e] hover:bg-[#3a2170] hover:text-[#fff4d6]'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Notices</span>
          {pendingNotices.length > 0 && (
            <span className="px-1.5 py-0.2 bg-[#d34c53] text-white text-[9px] font-bold border border-[#f4e6c8]">
              {pendingNotices.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('PROFILES')}
          className={`relative flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors cursor-pointer select-none border ${
            activeAdminTab === 'PROFILES'
              ? 'bg-[#f9c74f] text-[#1a1030] font-bold border-[#f4e6c8] shadow-xs'
              : 'bg-[#241548] text-[#b9a7e8] border-[#4b2f7e] hover:bg-[#3a2170] hover:text-[#fff4d6]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Registrations</span>
          {pendingStudents.length > 0 && (
            <span className="px-1.5 py-0.2 bg-[#d34c53] text-white text-[9px] font-bold border border-[#f4e6c8]">
              {pendingStudents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('ROSTER')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors cursor-pointer select-none border ${
            activeAdminTab === 'ROSTER'
              ? 'bg-[#f9c74f] text-[#1a1030] font-bold border-[#f4e6c8] shadow-xs'
              : 'bg-[#241548] text-[#b9a7e8] border-[#4b2f7e] hover:bg-[#3a2170] hover:text-[#fff4d6]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Directory ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('VIBE')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors cursor-pointer select-none border ${
            activeAdminTab === 'VIBE'
              ? 'bg-[#f9c74f] text-[#1a1030] font-bold border-[#f4e6c8] shadow-xs'
              : 'bg-[#241548] text-[#b9a7e8] border-[#4b2f7e] hover:bg-[#3a2170] hover:text-[#fff4d6]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Campus Poll</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('SETTINGS')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors cursor-pointer select-none border ${
            activeAdminTab === 'SETTINGS'
              ? 'bg-[#f9c74f] text-[#1a1030] font-bold border-[#f4e6c8] shadow-xs'
              : 'bg-[#241548] text-[#b9a7e8] border-[#4b2f7e] hover:bg-[#3a2170] hover:text-[#fff4d6]'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Settings & Security</span>
        </button>
      </div>

      {/* ----------------------------------------------------------------------
          TAB: OVERVIEW (With Quick Publishing Center)
      ----------------------------------------------------------------------- */}
      {activeAdminTab === 'OVERVIEW' && (
        <div className="space-y-6 font-mono">
          {/* Admin Profile & Digital Card Quick Access Card */}
          {!hasDevProfile ? (
            <div className="border-2 border-[#f9c74f] bg-[#f9c74f]/15 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 border-2 border-[#f9c74f] bg-[#f9c74f] text-[#1a1030] flex items-center justify-center font-bold text-xl shadow-[2px_2px_0_#060410] shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">
                      Developer / Admin Profile Not Linked
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f47b5c] text-[#1a1030] border border-[#f4e6c8]">
                      START HERE
                    </span>
                  </div>
                  <p className="text-xs text-[#b9a7e8] mt-0.5">
                    Click to load and register your Developer profile so classmates can view you on the directory and leaderboard.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAdminTab('MY_PROFILE')}
                  className="pixel-btn text-xs font-mono"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>⚡ Load Your Profile</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
              <div className="flex items-center gap-3.5">
                <img
                  src={profPhoto || developerProfile?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=95'}
                  alt={profName}
                  className="w-12 h-12 border-2 border-[#f4e6c8] object-cover shadow-[2px_2px_0_#060410]"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">{profName}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f47b5c] text-[#1a1030] border border-[#f4e6c8]">
                      DEVELOPER // ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-[#a08fd4] mt-0.5">
                    Roll #{profRoll} · {profDivision} · Card Theme: <span className="text-[#f9c74f] font-bold capitalize">{profTheme}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAdminTab('MY_PROFILE')}
                  className="pixel-btn text-xs font-mono"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>▶ Manage Profile & Card</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Publishing Center Cards */}
          <div>
            <div className="mb-3 flex items-center justify-between font-mono">
              <div>
                <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">Admin Publishing Center</h3>
                <p className="text-xs text-[#a08fd4]">1-Click shortcuts to upload materials and make department broadcasts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Card 1: Upload Notes */}
              <div
                onClick={() => setActiveAdminTab('NOTES')}
                className="bg-[#1a1030]/65 hover:bg-[#241548]/75 backdrop-blur-md border-2 border-[#4b2f7e]/80 hover:border-[#f9c74f] p-5 shadow-[4px_4px_0_#060410] transition-all cursor-pointer group flex flex-col justify-between font-mono"
              >
                <div>
                  <div className="w-10 h-10 border-2 border-[#f4e6c8] bg-[#f47b5c] text-[#1a1030] flex items-center justify-center mb-3 shadow-[2px_2px_0_#060410]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#f4e6c8] group-hover:text-[#f9c74f] transition-colors uppercase">
                    Upload Notes
                  </h4>
                  <p className="text-xs text-[#a08fd4] mt-1 leading-relaxed">
                    Upload lecture notes, chapter summaries, or fulfill open student note requests with files.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t-2 border-[#4b2f7e] flex items-center justify-between text-xs font-bold text-[#f9c74f]">
                  <span>Open Note Uploader</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2: Upload Resources */}
              <div
                onClick={() => setActiveAdminTab('RESOURCES')}
                className="bg-[#1a1030]/65 hover:bg-[#241548]/75 backdrop-blur-md border-2 border-[#4b2f7e]/80 hover:border-[#f9c74f] p-5 shadow-[4px_4px_0_#060410] transition-all cursor-pointer group flex flex-col justify-between font-mono"
              >
                <div>
                  <div className="w-10 h-10 border-2 border-[#f4e6c8] bg-[#f9c74f] text-[#1a1030] flex items-center justify-center mb-3 shadow-[2px_2px_0_#060410]">
                    <FolderArchive className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#f4e6c8] group-hover:text-[#f9c74f] transition-colors uppercase">
                    Upload Resources
                  </h4>
                  <p className="text-xs text-[#a08fd4] mt-1 leading-relaxed">
                    Publish university PYQs, lab manuals, cheat sheets, formula sheets, and reference books.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t-2 border-[#4b2f7e] flex items-center justify-between text-xs font-bold text-[#f9c74f]">
                  <span>Upload Materials</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3: Make Announcements */}
              <div
                onClick={() => setActiveAdminTab('ANNOUNCEMENTS')}
                className="bg-[#1a1030]/65 hover:bg-[#241548]/75 backdrop-blur-md border-2 border-[#4b2f7e]/80 hover:border-[#f9c74f] p-5 shadow-[4px_4px_0_#060410] transition-all cursor-pointer group flex flex-col justify-between font-mono"
              >
                <div>
                  <div className="w-10 h-10 border-2 border-[#f4e6c8] bg-[#f47b5c] text-[#1a1030] flex items-center justify-center mb-3 shadow-[2px_2px_0_#060410]">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#f4e6c8] group-hover:text-[#f9c74f] transition-colors uppercase">
                    Make Announcements
                  </h4>
                  <p className="text-xs text-[#a08fd4] mt-1 leading-relaxed">
                    Broadcast high-priority batch announcements with pinned status to all student notification feeds.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t-2 border-[#4b2f7e] flex items-center justify-between text-xs font-bold text-[#f9c74f]">
                  <span>Broadcast Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 4: Upload Notices */}
              <div
                onClick={() => setActiveAdminTab('NOTICES')}
                className="bg-[#1a1030]/65 hover:bg-[#241548]/75 backdrop-blur-md border-2 border-[#4b2f7e]/80 hover:border-[#f9c74f] p-5 shadow-[4px_4px_0_#060410] transition-all cursor-pointer group flex flex-col justify-between font-mono"
              >
                <div>
                  <div className="w-10 h-10 border-2 border-[#f4e6c8] bg-[#f9c74f] text-[#1a1030] flex items-center justify-center mb-3 shadow-[2px_2px_0_#060410]">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#f4e6c8] group-hover:text-[#f9c74f] transition-colors uppercase">
                    Upload Notices
                  </h4>
                  <p className="text-xs text-[#a08fd4] mt-1 leading-relaxed">
                    Publish official circulars, exam schedules, and university orders with attachments.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t-2 border-[#4b2f7e] flex items-center justify-between text-xs font-bold text-[#f9c74f]">
                  <span>Publish Notice</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 5: Campus Vibe Poll */}
              <div
                onClick={() => setActiveAdminTab('VIBE')}
                className="bg-[#1a1030]/65 hover:bg-[#241548]/75 backdrop-blur-md border-2 border-[#4b2f7e]/80 hover:border-[#f9c74f] p-5 shadow-[4px_4px_0_#060410] transition-all cursor-pointer group flex flex-col justify-between font-mono"
              >
                <div>
                  <div className="w-10 h-10 border-2 border-[#f4e6c8] bg-[#ff9844] text-[#1a1030] flex items-center justify-center mb-3 shadow-[2px_2px_0_#060410]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#f4e6c8] group-hover:text-[#f9c74f] transition-colors uppercase">
                    Campus Vibe Poll
                  </h4>
                  <p className="text-xs text-[#a08fd4] mt-1 leading-relaxed">
                    Customize the section title, add or delete mood choices, and update vote counts in real-time.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t-2 border-[#4b2f7e] flex items-center justify-between text-xs font-bold text-[#f9c74f]">
                  <span>Manage Vibe Poll</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
            <div className="bg-[#1a1030]/65 backdrop-blur-md border-2 border-[#4b2f7e]/80 p-5 shadow-[4px_4px_0_#060410]">
              <span className="text-[11px] font-bold text-[#a08fd4] uppercase tracking-wider block">
                Total Registered Students
              </span>
              <span className="text-2xl font-bold text-[#f9c74f] block mt-1">
                {students.length}
              </span>
              <span className="text-xs text-[#52b788] font-bold mt-1 block">
                {approvedStudents.length} Approved · {pendingStudents.length} Pending
              </span>
            </div>

            <div className="bg-[#1a1030]/65 backdrop-blur-md border-2 border-[#4b2f7e]/80 p-5 shadow-[4px_4px_0_#060410]">
              <span className="text-[11px] font-bold text-[#a08fd4] uppercase tracking-wider block">
                Active Circulars & Notices
              </span>
              <span className="text-2xl font-bold text-[#f9c74f] block mt-1">
                {notices.length}
              </span>
              <span className="text-xs text-[#b9a7e8] font-bold mt-1 block">
                {notices.filter((n) => n.status === 'APPROVED').length} Published Official Circulars
              </span>
            </div>

            <div className="bg-[#1a1030]/65 backdrop-blur-md border-2 border-[#4b2f7e]/80 p-5 shadow-[4px_4px_0_#060410]">
              <span className="text-[11px] font-bold text-[#a08fd4] uppercase tracking-wider block">
                Study Materials & PYQs
              </span>
              <span className="text-2xl font-bold text-[#f9c74f] block mt-1">
                {resources.length}
              </span>
              <span className="text-xs text-[#a08fd4] font-medium mt-1 block">
                Available in Academic Resources
              </span>
            </div>

            <div className="bg-[#1a1030]/65 backdrop-blur-md border-2 border-[#4b2f7e]/80 p-5 shadow-[4px_4px_0_#060410]">
              <span className="text-[11px] font-bold text-[#a08fd4] uppercase tracking-wider block">
                Notes Threads
              </span>
              <span className="text-2xl font-bold text-[#f9c74f] block mt-1">
                {noteRequests.length}
              </span>
              <span className="text-xs text-[#f47b5c] font-bold mt-1 block">
                {noteRequests.filter((r) => !r.fulfilled).length} pending student requests
              </span>
            </div>
          </div>

          {/* Pending Approvals & Multi-Device System Sync status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            <div className="bg-[#1a1030]/65 backdrop-blur-md border-2 border-[#4b2f7e]/80 p-6 shadow-[4px_4px_0_#060410] space-y-4">
              <h3 className="text-sm font-bold text-[#f9c74f] flex items-center gap-2 uppercase tracking-wider">
                <CheckCheck className="w-4 h-4 text-[#f47b5c]" />
                <span>Pending Approvals Overview</span>
              </h3>

              {pendingStudents.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-[#f4e6c8]">
                    You have <span className="font-bold text-[#f9c74f]">{pendingStudents.length}</span> student profile(s) awaiting verification.
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleApproveAllPending}
                      className="pixel-btn text-xs"
                    >
                      ▶ Approve All as Students
                    </button>
                    <button
                      onClick={() => setActiveAdminTab('PROFILES')}
                      className="pixel-btn-secondary text-xs"
                    >
                      Review Queue
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#2d6a4f]/25 border-2 border-[#52b788] text-[#52b788] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#52b788] shrink-0" />
                  <span>All student account registrations are verified and up to date!</span>
                </div>
              )}
            </div>

            <div className="bg-[#1a1030]/65 backdrop-blur-md border-2 border-[#4b2f7e]/80 p-6 shadow-[4px_4px_0_#060410] space-y-4">
              <h3 className="text-sm font-bold text-[#f9c74f] flex items-center gap-2 uppercase tracking-wider">
                <Radio className="w-4 h-4 text-[#52b788]" />
                <span>Multi-Device Database Synchronization</span>
              </h3>
              <p className="text-xs text-[#a08fd4] leading-relaxed">
                Persistent server database is running with Server-Sent Events (SSE) enabled. Notes, resources, notices, and announcements published here sync immediately to students on all devices.
              </p>
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2d6a4f]/30 text-[#52b788] border border-[#52b788] font-bold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#52b788] animate-pulse" />
                  Real-Time Database Active
                </span>
                <span className="text-[#a08fd4] font-mono text-[11px]">Server Port 3000 · data/database.json</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB: MY ADMIN PROFILE & CARD (Self-Management, Editing & Publishing)
      ----------------------------------------------------------------------- */}
      {activeAdminTab === 'MY_PROFILE' && (
        <div className="space-y-6 font-mono">
          {/* Top Profile Header Card */}
          {!hasDevProfile ? (
            <div className="border-2 border-[#f9c74f] bg-[#f9c74f]/15 p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 font-mono">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 border-2 border-[#f9c74f] bg-[#f9c74f] text-[#1a1030] flex items-center justify-center font-bold text-2xl shadow-[2px_2px_0_#060410] shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-[#f9c74f] uppercase tracking-wider">
                      Load & Register Developer Profile
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#f47b5c] text-[#1a1030] border border-[#f4e6c8]">
                      ROLE: DEVELOPER / ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-[#b9a7e8] mt-1 font-mono max-w-2xl leading-relaxed">
                    Fill out the form below to register and load your official profile. Once submitted, it will be automatically approved and visible to all other students in the directory and leaderboard with the official DEVELOPER / ADMIN mention in front.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <span className="px-3 py-1.5 bg-[#241548] text-[#f9c74f] border border-[#4b2f7e] text-xs font-bold">
                  ⚡ Verified Master Access
                </span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 font-mono">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={profPhoto || developerProfile?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=95'}
                    alt={profName}
                    className="w-16 h-16 border-2 border-[#f4e6c8] object-cover shadow-[2px_2px_0_#060410]"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#52b788] border-2 border-[#1a1030] flex items-center justify-center text-[#1a1030] text-[9px] font-bold">
                    ✓
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-[#f9c74f] uppercase tracking-wider">
                      {profName}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#f47b5c] text-[#1a1030] border border-[#f4e6c8]">
                      DEVELOPER // ADMIN
                    </span>
                    <span className="px-2 py-0.5 text-xs font-bold bg-[#241548] text-[#f9c74f] border border-[#4b2f7e] flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-[#f47b5c] fill-[#f47b5c]" />
                      <span>{developerProfile?.likes || 0} Likes</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#a08fd4] mt-1 font-mono">
                    Roll #{profRoll} · {profDivision} · {profBranch} ({profYear})
                  </p>
                  {profTag && (
                    <span className="inline-block mt-1 text-[11px] font-bold text-[#f9c74f] bg-[#241548]/90 px-2 py-0.5 border border-[#4b2f7e]">
                      🏷️ {profTag}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Action Dock */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => setViewingStudent(liveAdminStudent)}
                  className="pixel-btn text-xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>Full ID Card Modal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAdminTab('NOTES')}
                  className="pixel-btn-secondary text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-[#f9c74f]" />
                  <span>Upload Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAdminTab('RESOURCES')}
                  className="pixel-btn-secondary text-xs"
                >
                  <FolderArchive className="w-3.5 h-3.5 text-[#f47b5c]" />
                  <span>Upload Resource</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAdminTab('NOTICES')}
                  className="pixel-btn-secondary text-xs"
                >
                  <Megaphone className="w-3.5 h-3.5 text-[#f9c74f]" />
                  <span>Post Notice</span>
                </button>
              </div>
            </div>
          )}

          {/* Two-Column Editor Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono">
            {/* LEFT COLUMN: Live Digital ID Card + Theme Customizer + Photo Upload */}
            <div className="lg:col-span-5 space-y-6">
              {/* Live Interactive Card */}
              <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 shadow-[4px_4px_0_#060410] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#f9c74f]" />
                    <h4 className="text-sm font-bold text-[#f9c74f] uppercase tracking-wider">Live Digital ID Card</h4>
                  </div>
                  <span className="text-[11px] font-bold text-[#52b788] bg-[#2d6a4f]/30 px-2 py-0.5 border border-[#52b788]">
                    Real-Time Preview
                  </span>
                </div>

                <div className="bg-[#0b0819] border-2 border-[#4b2f7e] p-4 sm:p-5 flex flex-col items-center justify-center shadow-inner overflow-hidden">
                  <div className="w-full max-w-[340px] transform scale-[0.88] sm:scale-95 origin-center">
                    <GenZIdCard
                      student={liveAdminStudent}
                      selectedTheme={profTheme}
                      isOwnProfile={true}
                      showThemeBar={false}
                      showLikeShortcut={false}
                    />
                  </div>
                  <p className="text-[11px] text-[#a08fd4] mt-2 font-mono">
                    💡 Click or tap card to flip Front / Back
                  </p>
                </div>

                {/* ID Card Theme Selector */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#f4e6c8] block uppercase">
                      Choose ID Card Theme
                    </label>
                    <span className="text-[11px] font-bold text-[#f9c74f] uppercase font-mono">
                      {profTheme}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {(Object.keys(ID_CARD_THEMES) as IdCardTheme[]).map((themeKey) => {
                      const cfg = ID_CARD_THEMES[themeKey];
                      const isSelected = profTheme === themeKey;
                      return (
                        <button
                          key={themeKey}
                          type="button"
                          onClick={() => {
                            setProfTheme(themeKey);
                            soundEngine.playVibeVoteSound();
                          }}
                          className={`p-2.5 border-2 text-left flex items-center gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#f9c74f] bg-[#f9c74f]/25 text-[#f9c74f] shadow-[2px_2px_0_#060410]'
                              : 'border-[#4b2f7e] hover:border-[#f9c74f]/60 bg-[#1a1030]/80 text-[#f4e6c8]'
                          }`}
                        >
                          <span className="text-lg">{cfg?.emoji || '🎨'}</span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">{cfg?.name || themeKey}</span>
                            <span className="text-[10px] text-[#a08fd4] block truncate">{themeKey}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Profile Photo Uploader */}
                <div className="space-y-3 pt-3 border-t-2 border-[#4b2f7e]">
                  <PhotoUploadField
                    value={profPhoto}
                    onChange={(url) => setProfPhoto(url)}
                    label="Profile Photo"
                    helperText="Upload custom portrait from your device or pick a preset"
                  />

                  {/* Preset Avatars */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 font-mono">
                    <span className="text-[11px] text-[#a08fd4]">Quick Presets:</span>
                    {[
                      { label: 'Pro Dev', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=95' },
                      { label: 'Casual', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=95' },
                      { label: 'Geek', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=95' },
                      { label: 'Tech Lead', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=95' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setProfPhoto(preset.url)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-[#241548] hover:bg-[#3a2170] text-[#f9c74f] border border-[#4b2f7e] transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Full Profile Attributes Editor */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSaveAdminProfile} className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-6 shadow-[4px_4px_0_#060410] space-y-5">
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e]">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#f47b5c]" />
                    <div>
                      <h4 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">Personal & Academic Details</h4>
                      <p className="text-xs text-[#a08fd4]">Manage your personal profile visible on the directory and ID card</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-[#2d6a4f]/30 text-[#52b788] border border-[#52b788]">
                    Editable by Admin
                  </span>
                </div>

                {/* Name & Roll Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Full Name <span className="text-[#f47b5c]">*</span>
                    </label>
                    <input
                      type="text"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      placeholder="e.g. Priyanshu Gupta"
                      required
                      className="w-full px-3.5 py-2.5 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Roll Number <span className="text-[#f47b5c]">*</span>
                    </label>
                    <input
                      type="text"
                      value={profRoll}
                      onChange={(e) => handleRollChange(e.target.value)}
                      placeholder="e.g. 24"
                      required
                      className="w-full px-3.5 py-2.5 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                    <span className="text-[10px] text-[#a08fd4] mt-1 block">
                      Auto-batch: {profBatch}
                    </span>
                  </div>
                </div>

                {/* Division & Branch & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Division</label>
                    <input
                      type="text"
                      value={profDivision}
                      onChange={(e) => setProfDivision(e.target.value)}
                      placeholder="e.g. Div A (IT-1)"
                      className="w-full px-3 py-2 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Branch</label>
                    <input
                      type="text"
                      value={profBranch}
                      onChange={(e) => setProfBranch(e.target.value)}
                      placeholder="Information Technology"
                      className="w-full px-3 py-2 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Year</label>
                    <input
                      type="text"
                      value={profYear}
                      onChange={(e) => setProfYear(e.target.value)}
                      placeholder="1st Year (FE)"
                      className="w-full px-3 py-2 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>
                </div>

                {/* Gender & Batch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Gender</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Boys', 'Girls'] as GenderType[]).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setProfGender(g)}
                          className={`py-2 px-3 border-2 text-xs font-bold transition-all cursor-pointer ${
                            profGender === g
                              ? 'bg-[#f47b5c] text-[#1a1030] border-[#f4e6c8] shadow-[2px_2px_0_#060410]'
                              : 'bg-[#1a1030]/85 text-[#f4e6c8] border-[#4b2f7e] hover:bg-[#241548]'
                          }`}
                        >
                          {g === 'Boys' ? '👨 Boys' : '👩 Girls'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Batch Assignment</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['BATCH_1', 'BATCH_2', 'BATCH_3'] as BatchType[]).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setProfBatch(b)}
                          className={`py-2 px-2 border-2 text-[11px] font-bold transition-all cursor-pointer truncate ${
                            profBatch === b
                              ? 'bg-[#f9c74f] text-[#1a1030] border-[#f4e6c8] shadow-[2px_2px_0_#060410]'
                              : 'bg-[#1a1030]/85 text-[#f4e6c8] border-[#4b2f7e] hover:bg-[#241548]'
                          }`}
                        >
                          {b.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Profile Tag & Bio */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Profile Tag / Headline (Short Title)
                    </label>
                    <input
                      type="text"
                      value={profTag}
                      onChange={(e) => setProfTag(e.target.value)}
                      placeholder="e.g. Lead Engineer & Full-Stack Developer"
                      className="w-full px-3.5 py-2.5 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Bio / About Me
                    </label>
                    <textarea
                      rows={3}
                      value={profBio}
                      onChange={(e) => setProfBio(e.target.value)}
                      placeholder="Share a short introduction, your engineering aspirations, or tech interests..."
                      className="w-full px-3.5 py-2.5 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410] resize-none"
                    />
                  </div>
                </div>

                {/* Tech Interests & Skills */}
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    Tech Skills & Interests (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={profTech}
                    onChange={(e) => setProfTech(e.target.value)}
                    placeholder="e.g. React, Next.js, Python, Cloud, AI"
                    className="w-full px-3.5 py-2.5 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  />
                  {profTech && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {profTech.split(',').map((t, idx) => {
                        const cleanT = t.trim();
                        if (!cleanT) return null;
                        return (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] font-bold bg-[#241548] text-[#f9c74f] border border-[#4b2f7e]"
                          >
                            #{cleanT}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Contact & Socials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Email Address</label>
                    <input
                      type="email"
                      value={profEmail}
                      onChange={(e) => setProfEmail(e.target.value)}
                      placeholder="e.g. codingtech928@gmail.com"
                      className="w-full px-3.5 py-2 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Instagram Handle</label>
                    <input
                      type="text"
                      value={profInsta}
                      onChange={(e) => setProfInsta(e.target.value)}
                      placeholder="e.g. @priyanshu_tech"
                      className="w-full px-3.5 py-2 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">LinkedIn URL</label>
                    <input
                      type="text"
                      value={profLinkedIn}
                      onChange={(e) => setProfLinkedIn(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3.5 py-2 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>
                </div>

                {/* Student Login Password (Optional) */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    Student Login Password (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showProfPassword ? 'text' : 'password'}
                      value={profPassword}
                      onChange={(e) => setProfPassword(e.target.value)}
                      placeholder="Set password to login as a student via your roll number"
                      className="w-full px-3.5 py-2 pr-9 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProfPassword(!showProfPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a08fd4] hover:text-[#f4e6c8] cursor-pointer"
                    >
                      {showProfPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-[#a08fd4] mt-1 block">
                    Enables you to sign into student portal using Roll #{profRoll} and this password.
                  </span>
                </div>

                {/* Save Profile Button */}
                <div className="pt-3 border-t-2 border-[#4b2f7e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-[#a08fd4]">
                    {!hasDevProfile
                      ? 'Once registered, your profile will be immediately visible on directory & leaderboard.'
                      : 'All changes sync live to the student directory & ID card'}
                  </span>
                  <button
                    type="submit"
                    disabled={isSavingProf}
                    className="pixel-btn text-xs font-mono"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {isSavingProf
                        ? 'Publishing Profile...'
                        : !hasDevProfile
                        ? '⚡ Register & Publish Developer Profile'
                        : '▶ Save Profile Changes'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Admin Credentials & Security Card */}
              <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-6 shadow-[4px_4px_0_#060410] space-y-4 font-mono">
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 border-2 border-[#f4e6c8] bg-[#f47b5c] text-[#1a1030] flex items-center justify-center shadow-[2px_2px_0_#060410]">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#f9c74f] uppercase tracking-wider">Admin Login Credentials</h4>
                      <p className="text-xs text-[#a08fd4]">
                        Change the username and password required to unlock this admin console
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold px-2.5 py-1 bg-[#241548] text-[#f9c74f] border border-[#4b2f7e]">
                    Active: <span className="font-mono">{adminCredentials.username}</span>
                  </div>
                </div>

                {credsMsg && (
                  <div
                    className={`p-3 border-2 text-xs font-bold flex items-center gap-2 ${
                      credsMsg.type === 'success'
                        ? 'bg-[#2d6a4f]/30 text-[#52b788] border-[#52b788]'
                        : 'bg-[#d34c53]/20 text-[#f47b5c] border-[#d34c53]'
                    }`}
                  >
                    {credsMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#52b788] shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#f47b5c] shrink-0" />
                    )}
                    <span>{credsMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleSaveAdminCreds} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Admin Username <span className="text-[#f47b5c]">*</span>
                    </label>
                    <input
                      type="text"
                      value={customUserField}
                      onChange={(e) => setCustomUserField(e.target.value)}
                      placeholder="e.g. priyanshu or admin"
                      required
                      className="w-full px-3.5 py-2.5 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      New Password <span className="text-[#f47b5c]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCredPass ? 'text' : 'password'}
                        value={customPassField}
                        onChange={(e) => setCustomPassField(e.target.value)}
                        placeholder="Enter new password"
                        required
                        className="w-full px-3.5 py-2.5 pr-9 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCredPass(!showCredPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a08fd4] hover:text-[#f4e6c8] cursor-pointer"
                      >
                        {showCredPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="submit"
                      disabled={isSavingCreds}
                      className="pixel-btn text-xs font-mono w-full"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingCreds ? 'Saving...' : '▶ Save Credentials'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB 1: UPLOAD NOTES (Master Study Notes & Request Fulfillment)
      ----------------------------------------------------------------------- */}
      {activeAdminTab === 'NOTES' && (
        <div className="space-y-6 font-mono">
          {/* Success Toast */}
          {noteSuccessToast && (
            <div className="p-4 bg-[#2d6a4f]/25 border-2 border-[#52b788] text-[#52b788] text-xs font-bold font-mono flex items-center gap-2 shadow-[4px_4px_0_#060410]">
              <CheckCircle2 className="w-4 h-4 text-[#52b788] shrink-0" />
              <span>{noteSuccessToast}</span>
            </div>
          )}

          {/* Upload Notes Form */}
          <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] font-mono space-y-5">
            <div className="pb-3 border-b-2 border-[#4b2f7e] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#f9c74f]" />
                  <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">
                    {fulfillingReq ? `Fulfill Student Note Request: ${fulfillingReq.topic}` : 'Upload Official Lecture Notes'}
                  </h3>
                </div>
                <p className="text-xs text-[#a08fd4] mt-0.5">
                  Publish unit-wise handwritten notes, revision guides, and exam preparation material directly for students
                </p>
              </div>

              {fulfillingReq && (
                <button
                  onClick={() => setFulfillingReq(null)}
                  className="pixel-btn-secondary text-xs"
                >
                  Cancel Request Mode
                </button>
              )}
            </div>

            <form onSubmit={handleNoteUploadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Target Subject Name</label>
                  <input
                    type="text"
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value)}
                    placeholder="Enter subject name (e.g. Mathematics, BEE, Physics...)"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    Topic / Unit / Chapter Title
                  </label>
                  <input
                    type="text"
                    value={noteTopic}
                    onChange={(e) => setNoteTopic(e.target.value)}
                    placeholder="e.g. Unit 2: Differential Calculus & Taylor Series Complete Notes"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  />
                </div>
              </div>

              {/* File Attachment & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Document Attachment</label>
                  <div className="relative">
                    <input
                      type="file"
                      id="adminNoteFileInput"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNoteFileName(file.name);
                          setNoteFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                          if (file.name.endsWith('.pdf')) setNoteFileType('pdf');
                          else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) setNoteFileType('doc');
                          else setNoteFileType('image');
                          if (!noteTopic) {
                            setNoteTopic(file.name.replace(/\.[^/.]+$/, ''));
                          }
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="adminNoteFileInput"
                      className="w-full px-3.5 py-2.5 bg-[#1a1030] hover:bg-[#241548] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] flex items-center justify-between cursor-pointer shadow-[2px_2px_0_#060410]"
                    >
                      <span className="truncate">{noteFileName || 'Select or drop PDF file...'}</span>
                      <Upload className="w-4 h-4 text-[#f9c74f] shrink-0 ml-2" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">File Format</label>
                  <select
                    value={noteFileType}
                    onChange={(e) => setNoteFileType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  >
                    <option value="pdf" className="bg-[#1a1030]">PDF Document (.pdf)</option>
                    <option value="doc" className="bg-[#1a1030]">Word Document (.docx)</option>
                    <option value="image" className="bg-[#1a1030]">Handwritten Scans / Image</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Urgency / Preparation Tag</label>
                  <select
                    value={noteUrgency}
                    onChange={(e) => setNoteUrgency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  >
                    <option value="Normal" className="bg-[#1a1030]">Standard Lecture Notes</option>
                    <option value="High" className="bg-[#1a1030]">Urgent Exam Preparation</option>
                    <option value="Exam Tomorrow" className="bg-[#1a1030]">Exam Tomorrow / Last Night Revision</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                  Description / Instructor Remarks
                </label>
                <textarea
                  rows={3}
                  value={noteDescription}
                  onChange={(e) => setNoteDescription(e.target.value)}
                  placeholder="e.g. Includes all textbook theorems, formulas, step-by-step solved examples from previous 5 university exam papers."
                  className="w-full px-3.5 py-2.5 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="noteAlsoResource"
                  checked={noteAlsoResource}
                  onChange={(e) => setNoteAlsoResource(e.target.checked)}
                  className="w-4 h-4 accent-[#f47b5c]"
                />
                <label htmlFor="noteAlsoResource" className="text-xs text-[#f4e6c8] font-mono cursor-pointer">
                  Also index automatically into <strong className="text-[#f9c74f]">Academic Resources</strong> under <em>Lecture Notes</em>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="pixel-btn text-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>{fulfillingReq ? '▶ Submit Notes for Request' : '▶ Upload & Publish Notes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Student Note Requests Queue */}
          <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] font-mono space-y-4">
            <div className="pb-3 border-b-2 border-[#4b2f7e] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">Student Note Requests ({noteRequests.length})</h3>
                <p className="text-xs text-[#a08fd4]">Review topics requested by students and fulfill with study files</p>
              </div>
              <span className="text-xs font-bold text-[#f9c74f] bg-[#241548] px-2.5 py-1 border border-[#4b2f7e]">
                {noteRequests.filter((r) => !r.fulfilled).length} Awaiting Notes
              </span>
            </div>

            <div className="divide-y divide-[#4b2f7e]/60 max-h-[450px] overflow-y-auto">
              {noteRequests.map((req) => (
                <div key={req.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#f4e6c8] text-sm">{req.topic}</span>
                      <span className="px-2 py-0.5 bg-[#241548] text-[#f9c74f] border border-[#4b2f7e] text-[10px] font-bold">
                        {req.subject}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                        req.fulfilled ? 'bg-[#2d6a4f]/30 text-[#52b788] border-[#52b788]' : 'bg-[#d34c53]/20 text-[#f47b5c] border-[#d34c53]'
                      }`}>
                        {req.fulfilled ? `Fulfilled (${req.fulfillments?.length || 0})` : 'Awaiting Notes'}
                      </span>
                    </div>
                    <p className="text-[#a08fd4] text-[11px]">
                      Requested by {req.requestedBy.name} (#{req.requestedBy.rollNumber}) · Priority: {req.urgency}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setFulfillingReq(req);
                        setNoteSubject(req.subject);
                        setNoteTopic(req.topic);
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                      }}
                      className="pixel-btn-amber text-xs py-1 px-3"
                    >
                      <span>▶ Fulfill with Notes</span>
                    </button>

                    <button
                      onClick={() => {
                        deleteNoteRequest(req.id);
                        showToast('Note thread deleted.');
                      }}
                      className="p-1.5 text-[#a08fd4] hover:text-[#f47b5c] hover:bg-[#d34c53]/20 border border-transparent hover:border-[#d34c53] cursor-pointer"
                      title="Delete Thread"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {noteRequests.length === 0 && (
                <div className="py-8 text-center text-[#a08fd4] text-xs">
                  No note requests submitted yet. Use the form above to upload official master notes!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB 2: UPLOAD RESOURCES (PYQs, Manuals, Formula Sheets, Cheat Sheets)
      ----------------------------------------------------------------------- */}
      {activeAdminTab === 'RESOURCES' && (
        <div className="space-y-6 font-mono">
          {/* Success Toast */}
          {resSuccessToast && (
            <div className="p-4 bg-[#2d6a4f]/25 border-2 border-[#52b788] text-[#52b788] text-xs font-bold font-mono flex items-center gap-2 shadow-[4px_4px_0_#060410]">
              <CheckCircle2 className="w-4 h-4 text-[#52b788] shrink-0" />
              <span>{resSuccessToast}</span>
            </div>
          )}

          {/* Upload Resource Form */}
          <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] font-mono space-y-5">
            <div className="pb-3 border-b-2 border-[#4b2f7e]">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-[#f9c74f]" />
                <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">Upload Academic Study Resource</h3>
              </div>
              <p className="text-xs text-[#a08fd4] mt-0.5">
                Upload university question papers, lab manuals, formula sheets, reference books & cheat sheets
              </p>
            </div>

            <form onSubmit={handleResourceUploadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Resource Title</label>
                  <input
                    type="text"
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    placeholder="e.g. 2024 University Mid-Sem Question Papers with Solutions"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Subject Name</label>
                  <input
                    type="text"
                    value={resSubject}
                    onChange={(e) => setResSubject(e.target.value)}
                    placeholder="Enter subject name (e.g. Mathematics, BEE, Physics...)"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Resource Category</label>
                  <select
                    value={resCategory}
                    onChange={(e) => setResCategory(e.target.value as ResourceItem['category'])}
                    className="w-full px-3.5 py-2.5 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  >
                    <option value="Verified PYQ" className="bg-[#1a1030]">Verified PYQ (Previous Year Questions)</option>
                    <option value="Formula Sheet" className="bg-[#1a1030]">Formula Sheet / Cheat Sheet</option>
                    <option value="Lab Manual" className="bg-[#1a1030]">Lab Manual & Code Repository</option>
                    <option value="Lecture Notes" className="bg-[#1a1030]">Lecture Notes & Slides</option>
                    <option value="Reference Book" className="bg-[#1a1030]">Reference Book / PDF Guide</option>
                    <option value="Cheat Sheet" className="bg-[#1a1030]">Quick Exam Revision Sheet</option>
                  </select>
                </div>
              </div>

              {/* File Attachment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Attach Material File</label>
                  <div className="relative">
                    <input
                      type="file"
                      id="adminResFileInput"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setResFileName(file.name);
                          setResFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                          if (file.name.endsWith('.zip')) setResFileType('zip');
                          else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) setNoteFileType('doc');
                          else setResFileType('pdf');
                          if (!resTitle) setResTitle(file.name.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="adminResFileInput"
                      className="w-full px-3.5 py-2.5 bg-[#1a1030] hover:bg-[#241548] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] flex items-center justify-between cursor-pointer shadow-[2px_2px_0_#060410]"
                    >
                      <span className="truncate">{resFileName || 'Click to select PDF, ZIP, or DOC file...'}</span>
                      <Upload className="w-4 h-4 text-[#f9c74f] shrink-0 ml-2" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">File Size & Format</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={resFileSize}
                      onChange={(e) => setResFileSize(e.target.value)}
                      placeholder="e.g. 4.2 MB"
                      className="w-1/2 px-3.5 py-2.5 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    />
                    <select
                      value={resFileType}
                      onChange={(e) => setResFileType(e.target.value as any)}
                      className="w-1/2 px-3.5 py-2.5 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                    >
                      <option value="pdf" className="bg-[#1a1030]">PDF</option>
                      <option value="doc" className="bg-[#1a1030]">Word DOC</option>
                      <option value="zip" className="bg-[#1a1030]">ZIP Archive</option>
                      <option value="image" className="bg-[#1a1030]">Image Scan</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                  Description / Syllabus Topics
                </label>
                <textarea
                  rows={2}
                  value={resDescription}
                  onChange={(e) => setResDescription(e.target.value)}
                  placeholder="e.g. Verified university question paper covering Units 1 to 4 with standard marking schemes."
                  className="w-full px-3.5 py-2.5 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="pixel-btn text-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>▶ Upload & Stamp Verified Admin Badge</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Resources Directory */}
          <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] font-mono space-y-4">
            <div className="pb-3 border-b-2 border-[#4b2f7e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">
                  Manage Academic Resources ({resources.length})
                </h3>
                <p className="text-xs text-[#a08fd4]">Search, verify, and moderate existing study materials</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#a08fd4] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={resSearch}
                    onChange={(e) => setResSearch(e.target.value)}
                    placeholder="Search resources..."
                    className="pl-8 pr-3 py-1.5 bg-[#1a1030]/85 border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] placeholder-[#a08fd4]/60 focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                  />
                </div>

                <select
                  value={resCategoryFilter}
                  onChange={(e) => setResCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#1a1030] border-2 border-[#4b2f7e] text-xs font-mono text-[#f4e6c8] focus:border-[#f9c74f] outline-none shadow-[2px_2px_0_#060410]"
                >
                  <option value="ALL" className="bg-[#1a1030]">All Categories</option>
                  <option value="Verified PYQ" className="bg-[#1a1030]">Verified PYQs</option>
                  <option value="Formula Sheet" className="bg-[#1a1030]">Formula Sheets</option>
                  <option value="Lab Manual" className="bg-[#1a1030]">Lab Manuals</option>
                  <option value="Lecture Notes" className="bg-[#1a1030]">Lecture Notes</option>
                  <option value="Reference Book" className="bg-[#1a1030]">Reference Books</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-[#4b2f7e]/60 max-h-[450px] overflow-y-auto">
              {resources
                .filter((r) => {
                  const matchCat = resCategoryFilter === 'ALL' || r.category === resCategoryFilter;
                  const matchQ =
                    !resSearch ||
                    r.title.toLowerCase().includes(resSearch.toLowerCase()) ||
                    r.subject.toLowerCase().includes(resSearch.toLowerCase());
                  return matchCat && matchQ;
                })
                .map((res) => (
                  <div key={res.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#f4e6c8] text-sm">{res.title}</span>
                        <span className="px-2 py-0.5 bg-[#241548] text-[#f9c74f] border border-[#4b2f7e] text-[10px] font-bold">
                          {res.category}
                        </span>
                        <span className="px-2 py-0.5 bg-[#1a1030] text-[#f47b5c] border border-[#4b2f7e] text-[10px] font-bold">
                          {res.subject}
                        </span>
                      </div>
                      <p className="text-[#a08fd4] text-[11px]">
                        File: {res.fileName} ({res.fileSize}) · Uploaded by {res.uploadedBy.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          showToast(`Starting file download test: ${res.fileName}`);
                        }}
                        className="pixel-btn-secondary text-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => {
                          deleteResource(res.id);
                          showToast(`Resource "${res.title}" deleted.`);
                        }}
                        className="p-1.5 text-[#a08fd4] hover:text-[#f47b5c] hover:bg-[#d34c53]/20 border border-transparent hover:border-[#d34c53] cursor-pointer"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

              {resources.length === 0 && (
                <div className="py-8 text-center text-[#a08fd4] text-xs">
                  No resources uploaded yet. Use the form above to publish PYQs, lab manuals, and study guides!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB 3: MAKE ANNOUNCEMENTS (Department Broadcasts & CR Alerts)
      ----------------------------------------------------------------------- */}
      {activeAdminTab === 'ANNOUNCEMENTS' && (
        <div className="space-y-6">
          {/* Success Banner */}
          {announcementSuccess && (
            <div className="p-4 bg-[#2d6a4f]/25 border-2 border-[#52b788] text-[#52b788] text-xs font-mono font-bold flex items-center gap-2 shadow-[4px_4px_0_#060410]">
              <CheckCircle2 className="w-4 h-4 text-[#52b788] shrink-0" />
              <span>Department announcement broadcasted! Student notification bubbles and live feeds updated.</span>
            </div>
          )}

          <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] font-mono space-y-5">
            <div className="pb-3 border-b-2 border-[#4b2f7e]">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#f9c74f]" />
                <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">Make Instant Department Announcement</h3>
              </div>
              <p className="text-xs text-[#a08fd4] mt-0.5">
                Broadcast official reminders, schedule revisions, and urgent messages directly to all batch representatives and students
              </p>
            </div>

            <form onSubmit={handleAnnouncementSubmit} className="space-y-4 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Announcement Category</label>
                  <select
                    value={announcementCategory}
                    onChange={(e) => setAnnouncementCategory(e.target.value as NoticeItem['category'])}
                    className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] font-mono text-xs focus:outline-none transition-colors"
                  >
                    <option value="CR Announcement">CR / Lead Announcement</option>
                    <option value="Urgent">Urgent Alert</option>
                    <option value="Exam Schedule">Exam / Test Update</option>
                    <option value="Lab Submission">Lab Journal Submission</option>
                    <option value="College Event">College Event / Hackathon</option>
                    <option value="Academic">General Academic Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Target Audience</label>
                  <select
                    value={announcementAudience}
                    onChange={(e) => setAnnouncementAudience(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] font-mono text-xs focus:outline-none transition-colors"
                  >
                    <option value="All Batches (Roll 1-63)">All Batches (Roll 1-63)</option>
                    <option value="Batch 1 (Roll 1-22)">Batch 1 Only (Roll 1-22)</option>
                    <option value="Batch 2 (Roll 23-43)">Batch 2 Only (Roll 23-43)</option>
                    <option value="Batch 3 (Roll 44-63)">Batch 3 Only (Roll 44-63)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Official Signatory</label>
                  <input
                    type="text"
                    value={announcementAuthor}
                    onChange={(e) => setAnnouncementAuthor(e.target.value)}
                    placeholder="e.g. Department Administrator"
                    className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] placeholder:text-[#a08fd4]/70 font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                  Announcement Headline
                </label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. Mandatory Lab Submission Deadline & Practical Timings for Tomorrow"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] placeholder:text-[#a08fd4]/70 font-mono text-xs focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                  Announcement Body & Instructions
                </label>
                <textarea
                  rows={4}
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  placeholder="Provide all specific instructions, timings, room allocations, or required stationery for the students..."
                  required
                  className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] placeholder:text-[#a08fd4]/70 font-mono text-xs focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="announcementPinned"
                  checked={announcementPinned}
                  onChange={(e) => setAnnouncementPinned(e.target.checked)}
                  className="w-4 h-4 bg-[#241548] border-2 border-[#4b2f7e] text-[#f9c74f] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="announcementPinned" className="text-xs text-[#f4e6c8] font-bold cursor-pointer">
                  Pin this announcement to the top of the student noticeboard
                </label>
              </div>

              {/* Preview Box */}
              {announcementTitle && (
                <div className="p-4 bg-[#241548]/90 border-2 border-[#4b2f7e] space-y-2 shadow-[3px_3px_0_#060410]">
                  <span className="text-[11px] font-bold text-[#f9c74f] uppercase tracking-wider block">
                    Student Noticeboard Preview
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#150c28] text-[#f47b5c] border border-[#4b2f7e] text-[10px] font-bold">
                      {announcementCategory}
                    </span>
                    {announcementPinned && (
                      <span className="px-2 py-0.5 bg-[#f9c74f] text-[#1a1030] text-[10px] font-bold border border-[#f4e6c8] flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[#f4e6c8]">
                    [ANNOUNCEMENT - {announcementAudience}] {announcementTitle}
                  </h4>
                  <p className="text-xs text-[#a08fd4] whitespace-pre-wrap">{announcementMsg || 'Announcement body...'}</p>
                  <p className="text-[11px] text-[#8271b3]">By {announcementAuthor} · Just now</p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="pixel-btn text-xs font-mono"
                >
                  <Send className="w-4 h-4" />
                  <span>▶ Broadcast Announcement Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB 4: UPLOAD NOTICES (Official Circulars, Verification & Queue)
      ----------------------------------------------------------------------- */}
      {activeAdminTab === 'NOTICES' && (
        <div className="space-y-6 font-mono">
          {/* Success Banner */}
          {noticeSuccess && (
            <div className="p-4 bg-[#2d6a4f]/25 border-2 border-[#52b788] text-[#52b788] text-xs font-mono font-bold flex items-center gap-2 shadow-[4px_4px_0_#060410]">
              <CheckCircle2 className="w-4 h-4 text-[#52b788] shrink-0" />
              <span>Official notice published with verified department seal!</span>
            </div>
          )}

          {/* Upload Notice Form */}
          <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] font-mono space-y-5">
            <div className="pb-3 border-b-2 border-[#4b2f7e]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#f9c74f]" />
                <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">Upload Official Circular / Notice</h3>
              </div>
              <p className="text-xs text-[#a08fd4] mt-0.5">
                Issue official university circulars, academic notices, and examination directives with verified authenticity
              </p>
            </div>

            <form onSubmit={handleNoticeUploadSubmit} className="space-y-4 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Circular Category</label>
                  <select
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value as NoticeItem['category'])}
                    className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] font-mono text-xs focus:outline-none transition-colors"
                  >
                    <option value="Academic">Academic Notice / Order</option>
                    <option value="Exam Schedule">University Examination Schedule</option>
                    <option value="Lab Submission">Term-Work / Lab Journal Submission</option>
                    <option value="College Event">College Event / Symposium</option>
                    <option value="Urgent">Urgent Notification</option>
                    <option value="CR Announcement">Department Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Signatory / Issuing Authority</label>
                  <input
                    type="text"
                    value={noticeAuthorTitle}
                    onChange={(e) => setNoticeAuthorTitle(e.target.value)}
                    placeholder="e.g. Office of the Head of Department (IT)"
                    className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] placeholder:text-[#a08fd4]/70 font-mono text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                  Circular Subject / Headline
                </label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Circular Ref #2026/IT/04: Commencement of First Year End-Semester Examinations"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] placeholder:text-[#a08fd4]/70 font-mono text-xs focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                  Official Notice Body & Directives
                </label>
                <textarea
                  rows={4}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Provide the complete circular text, timetable details, regulations, and reporting instructions..."
                  required
                  className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] placeholder:text-[#a08fd4]/70 font-mono text-xs focus:outline-none transition-colors"
                />
              </div>

              {/* Document / Circular Attachment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">Optional Notice PDF / Document</label>
                  <div className="relative">
                    <input
                      type="file"
                      id="adminNoticeFileInput"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNoticeAttachmentName(file.name);
                          setNoticeAttachmentSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="adminNoticeFileInput"
                      className="w-full px-3.5 py-2.5 bg-[#241548] hover:bg-[#321c60] border-2 border-[#4b2f7e] text-xs font-bold text-[#f4e6c8] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="truncate">{noticeAttachmentName || 'Attach official circular PDF...'}</span>
                      <Upload className="w-4 h-4 text-[#f9c74f] shrink-0 ml-2" />
                    </label>
                  </div>
                </div>

                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="noticePinnedCheckbox"
                    checked={noticePinned}
                    onChange={(e) => setNoticePinned(e.target.checked)}
                    className="w-4 h-4 bg-[#241548] border-2 border-[#4b2f7e] text-[#f9c74f] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="noticePinnedCheckbox" className="ml-2 text-xs text-[#f4e6c8] font-bold cursor-pointer">
                    Pin notice with verified admin banner
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="pixel-btn text-xs font-mono"
                >
                  <Upload className="w-4 h-4" />
                  <span>▶ Publish & Broadcast Notice</span>
                </button>
              </div>
            </form>
          </div>

          {/* Pending Circulars Queue (from Students / CRs) */}
          <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] font-mono space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e]">
              <div>
                <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">
                  Student-Submitted Circulars Verification ({pendingNotices.length} Pending)
                </h3>
                <p className="text-xs text-[#a08fd4]">Review and authorize notices submitted by students before publication</p>
              </div>
            </div>

            <div className="space-y-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="bg-[#1a1030]/80 p-4 border-2 border-[#4b2f7e] space-y-2 shadow-[2px_2px_0_#060410]"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 bg-[#241548] text-[#f9c74f] border border-[#4b2f7e]">
                        {n.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                        n.status === 'APPROVED' ? 'bg-[#2d6a4f]/30 text-[#52b788] border-[#52b788]' : 'bg-[#d97706]/30 text-[#f9c74f] border-[#f9c74f]'
                      }`}>
                        {n.status}
                      </span>
                      {n.pinned && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f9c74f] text-[#1a1030] border border-[#f4e6c8] flex items-center gap-1">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#a08fd4]">By {n.authorName || n.postedBy.name}</span>
                  </div>

                  <h4 className="text-sm font-bold text-[#f4e6c8]">{n.title}</h4>
                  <p className="text-xs text-[#b9a7e8] leading-relaxed whitespace-pre-wrap">{n.content}</p>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    {n.status === 'PENDING_APPROVAL' && (
                      <button
                        onClick={() => {
                          approveNotice(n.id);
                          showToast(`Notice approved and published!`);
                        }}
                        className="pixel-btn text-xs py-1 px-3"
                      >
                        Authorize & Publish
                      </button>
                    )}

                    <button
                      onClick={() => {
                        deleteNotice(n.id);
                        showToast(`Notice removed.`);
                      }}
                      className="pixel-btn-crimson text-xs py-1 px-3"
                    >
                      Delete Notice
                    </button>
                  </div>
                </div>
              ))}

              {notices.length === 0 && (
                <div className="p-8 text-center text-[#a08fd4] text-xs">
                  No circulars or bulletins found. Use the uploader above to create one.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB: PENDING PROFILES
      ----------------------------------------------------------------------- */}
      {activeAdminTab === 'PROFILES' && (
        <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] font-mono space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e] flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">Student Profile Approval Queue</h3>
              <p className="text-xs text-[#a08fd4]">Verify registered student information before granting full portal access</p>
            </div>
            {pendingStudents.length > 0 && (
              <button
                onClick={handleApproveAllPending}
                className="pixel-btn text-xs py-1 px-3"
              >
                Approve All ({pendingStudents.length})
              </button>
            )}
          </div>

          {pendingStudents.length > 0 ? (
            <div className="space-y-3">
              {pendingStudents.map((s) => (
                <div
                  key={s.id}
                  className="bg-[#1a1030]/80 p-4 border-2 border-[#4b2f7e] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[2px_2px_0_#060410]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 border-2 border-[#f4e6c8] overflow-hidden bg-[#241548] shrink-0 shadow-[2px_2px_0_#060410]">
                      <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#f4e6c8]">{s.name}</h4>
                        <span className="px-2 py-0.5 bg-[#d97706]/30 text-[#f9c74f] border border-[#f9c74f] text-[10px] font-bold">
                          Pending
                        </span>
                      </div>
                      <p className="text-xs text-[#a08fd4] mt-0.5 font-mono">
                        Roll #{s.rollNumber} · {s.division} · {s.phoneNumber || 'No phone'} · {s.email}
                      </p>
                      {s.techInterest && (
                        <p className="text-[11px] text-[#f9c74f] font-mono mt-0.5">
                          Tech: {s.techInterest}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setViewingStudent(s)}
                      className="px-2.5 py-1.5 bg-[#241548] hover:bg-[#3a2170] text-[#f9c74f] border border-[#4b2f7e] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#f47b5c]" />
                      <span>Preview ID</span>
                    </button>

                    <select
                      value={selectedRoles[s.id] || 'STUDENT'}
                      onChange={(e) => setSelectedRoles((prev) => ({ ...prev, [s.id]: e.target.value as StudentRole }))}
                      className="px-2.5 py-1.5 bg-[#241548] border-2 border-[#4b2f7e] text-xs font-mono text-[#fff4d6] focus:border-[#f9c74f] focus:outline-none"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.role} value={r.role}>
                          {r.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleApproveWithRole(s)}
                      className="pixel-btn text-xs py-1.5 px-3"
                      title="Approve student and assign role"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleDismissPending(s)}
                      className="px-2.5 py-1.5 bg-[#d97706]/20 hover:bg-[#d97706]/40 text-[#f9c74f] border border-[#f9c74f] text-xs font-bold transition-colors cursor-pointer"
                      title="Dismiss registration request"
                    >
                      Dismiss
                    </button>

                    <button
                      onClick={() => handleRejectDeletePending(s)}
                      className="pixel-btn-crimson text-xs py-1.5 px-3"
                      title="Delete profile record completely"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-[#a08fd4] text-xs">
              All student registrations have been reviewed. No pending accounts in queue.
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB: ROSTER & MANAGEMENT
      ----------------------------------------------------------------------- */}
      {activeAdminTab === 'ROSTER' && (
        <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] font-mono space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#4b2f7e]">
            <div>
              <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">Student Directory & Full Profile Control</h3>
              <p className="text-xs text-[#a08fd4]">Edit information, assign roles, tune likes, or delete accounts</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#a08fd4] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Search name, roll, tech..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-xs text-[#fff4d6] placeholder:text-[#a08fd4]/70 font-mono focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="divide-y-2 divide-[#4b2f7e]/60 max-h-[600px] overflow-y-auto pr-1">
            {students
              .filter(
                (s) =>
                  !rosterSearch ||
                  s.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
                  String(s.rollNumber).includes(rosterSearch) ||
                  s.techInterest.toLowerCase().includes(rosterSearch.toLowerCase())
              )
              .map((s) => (
                <div key={s.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border-2 border-[#f4e6c8] overflow-hidden bg-[#241548] shrink-0 shadow-[2px_2px_0_#060410]">
                      <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#f4e6c8]">{s.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#241548] text-[#f9c74f] border border-[#4b2f7e]">
                          {s.role}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                          s.status === 'APPROVED' ? 'bg-[#2d6a4f]/30 text-[#52b788] border-[#52b788]' : 'bg-[#d97706]/30 text-[#f9c74f] border-[#f9c74f]'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <div className="text-[#a08fd4] font-mono text-[11px] mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>Roll #{s.rollNumber}</span>
                        <span>·</span>
                        <span>{s.email}</span>
                        <span>·</span>
                        <span>Likes: <strong className="text-[#f9c74f] font-bold">{s.likes}</strong></span>
                        {s.techInterest && (
                          <>
                            <span>·</span>
                            <span className="text-[#f47b5c]">Tech: {s.techInterest}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* View ID Card */}
                    <button
                      onClick={() => setViewingStudent(s)}
                      className="px-2.5 py-1.5 bg-[#241548] hover:bg-[#3a2170] text-[#f9c74f] border border-[#4b2f7e] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      title="Preview this student's digital ID card"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-[#f47b5c]" />
                      <span>View ID</span>
                    </button>

                    {/* Quick Like Tuning */}
                    <button
                      onClick={() => handleApplyLikesBoost(s.id, 10)}
                      className="px-2 py-1.5 bg-[#f47b5c]/20 hover:bg-[#f47b5c]/35 text-[#f47b5c] border border-[#f47b5c]/60 text-xs font-bold transition-colors cursor-pointer"
                      title="Add 10 Likes"
                    >
                      +10 Likes
                    </button>

                    {/* Edit Student Profile */}
                    <button
                      onClick={() => setEditingStudent(s)}
                      className="px-2.5 py-1.5 bg-[#241548] hover:bg-[#3a2170] text-[#fff4d6] border border-[#4b2f7e] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#f9c74f]" />
                      <span>Edit</span>
                    </button>

                    {/* Role Dropdown */}
                    <select
                      value={s.role}
                      onChange={(e) => {
                        updateStudentProfile(s.id, { role: e.target.value as StudentRole });
                        showToast(`Updated role for ${s.name}`);
                      }}
                      className="px-2.5 py-1.5 bg-[#241548] border-2 border-[#4b2f7e] text-xs font-mono text-[#fff4d6] focus:border-[#f9c74f] focus:outline-none"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.role} value={r.role}>
                          {r.label}
                        </option>
                      ))}
                    </select>

                    {/* Delete Student */}
                    <button
                      onClick={() => {
                        deleteStudent(s.id);
                        showToast(`Deleted ${s.name}`);
                      }}
                      className="p-1.5 text-[#a08fd4] hover:text-[#d34c53] hover:bg-[#d34c53]/20 border border-transparent hover:border-[#d34c53] transition-colors cursor-pointer"
                      title="Permanently Delete Student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

            {students.length === 0 && (
              <div className="py-10 text-center text-[#a08fd4] text-xs">
                No students registered yet. Once a student registers, they will appear here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB: CAMPUS VIBE MANAGEMENT
      ----------------------------------------------------------------------- */}
      {activeAdminTab === 'VIBE' && (
        <div className="space-y-6 font-mono">
          {/* Header & Quick Action Presets */}
          <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="p-1 border-2 border-[#f4e6c8] bg-[#f47b5c] text-[#1a1030] shadow-[2px_2px_0_#060410]">
                  <Sparkles className="w-4 h-4 text-[#1a1030]" />
                </span>
                <h3 className="text-lg font-bold text-[#f9c74f] uppercase tracking-wider">Today's Campus Vibe Section Manager</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#2d6a4f]/40 text-[#52b788] border border-[#52b788]">
                  Live on Homepage
                </span>
              </div>
              <p className="text-xs text-[#a08fd4] max-w-xl leading-relaxed">
                Change the section heading, customize prompt subtitles, add new interactive options with emojis, edit or delete existing options, and reset vote counts across all students.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleResetAllVotes}
                className="pixel-btn-secondary text-xs"
                title="Reset all vote numbers back to 0 for a new day"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Votes to 0</span>
              </button>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-4 shadow-[4px_4px_0_rgba(6,4,16,0.65)]">
            <p className="text-xs font-bold text-[#f4e6c8] mb-2 flex items-center gap-1.5 uppercase">
              <span>⚡ 1-Click Topic Presets</span>
              <span className="text-[11px] font-normal text-[#a08fd4] normal-case">(Quickly load pre-built titles and vibe options)</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset({
                    title: "Today's Campus Vibe",
                    subtitle: 'Tap what describes your study mood today',
                    options: [
                      { id: 'opt_grind', label: 'Midsem / Exam Grind', icon: '📚', count: 0 },
                      { id: 'opt_hack', label: 'Coding & Projects', icon: '💻', count: 0 },
                      { id: 'opt_canteen', label: 'Canteen & Chill', icon: '☕', count: 0 },
                      { id: 'opt_lab', label: 'Lab Submissions', icon: '⚡', count: 0 },
                    ],
                  })
                }
                className="p-2.5 bg-[#1a1030]/80 hover:bg-[#241548] border-2 border-[#4b2f7e] hover:border-[#f9c74f] text-xs text-left transition-colors cursor-pointer shadow-[2px_2px_0_#060410]"
              >
                <span className="block font-bold text-[#f9c74f]">📚 Regular Day</span>
                <span className="text-[10px] text-[#a08fd4]">Midsem, Coding, Chill, Labs</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyPreset({
                    title: 'Exam Season Vibe Check',
                    subtitle: 'How is the semester exam prep going?',
                    options: [
                      { id: 'opt_cram', label: 'Last-minute PYQ Cramming', icon: '📖', count: 0 },
                      { id: 'opt_fried', label: 'Brain Fried from BEE & Math', icon: '🧠', count: 0 },
                      { id: 'opt_coffee', label: 'Running on 3am Chai / Coffee', icon: '☕', count: 0 },
                      { id: 'opt_pray', label: 'Praying for Passing Marks', icon: '🙏', count: 0 },
                    ],
                  })
                }
                className="p-2.5 bg-[#1a1030]/80 hover:bg-[#241548] border-2 border-[#4b2f7e] hover:border-[#f9c74f] text-xs text-left transition-colors cursor-pointer shadow-[2px_2px_0_#060410]"
              >
                <span className="block font-bold text-[#f9c74f]">🧠 Exam Season</span>
                <span className="text-[10px] text-[#a08fd4]">PYQ Cram, Chai, Passing Marks</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyPreset({
                    title: 'College Fest & Events Pulse',
                    subtitle: 'What are you participating in today?',
                    options: [
                      { id: 'opt_dance', label: 'Dance & Cultural Stage', icon: '💃', count: 0 },
                      { id: 'opt_music', label: 'Band / Concert Jamming', icon: '🎸', count: 0 },
                      { id: 'opt_food', label: 'Food Stalls & Chilling', icon: '🍕', count: 0 },
                      { id: 'opt_org', label: 'Event Organizing Duty', icon: '📋', count: 0 },
                    ],
                  })
                }
                className="p-2.5 bg-[#1a1030]/80 hover:bg-[#241548] border-2 border-[#4b2f7e] hover:border-[#f9c74f] text-xs text-left transition-colors cursor-pointer shadow-[2px_2px_0_#060410]"
              >
                <span className="block font-bold text-[#f9c74f]">🎉 Fest Week</span>
                <span className="text-[10px] text-[#a08fd4]">Dance, Jamming, Food, Org</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyPreset({
                    title: 'Hackathon & Dev Weekend',
                    subtitle: 'What is your build status right now?',
                    options: [
                      { id: 'opt_debug', label: 'Debugging Code at 3 AM', icon: '🐛', count: 0 },
                      { id: 'opt_ship', label: 'Shipping Feature MVP', icon: '🚀', count: 0 },
                      { id: 'opt_design', label: 'UI / UX Figma Polishing', icon: '🎨', count: 0 },
                      { id: 'opt_pitch', label: 'Preparing Pitch Slides', icon: '💡', count: 0 },
                    ],
                  })
                }
                className="p-2.5 bg-[#1a1030]/80 hover:bg-[#241548] border-2 border-[#4b2f7e] hover:border-[#f9c74f] text-xs text-left transition-colors cursor-pointer shadow-[2px_2px_0_#060410]"
              >
                <span className="block font-bold text-[#f9c74f]">💻 Hackathon</span>
                <span className="text-[10px] text-[#a08fd4]">Debugging, Ship MVP, Figma</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Title Config & Options List */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Change Title & Subtitle Form */}
              <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] space-y-4">
                <div className="pb-3 border-b-2 border-[#4b2f7e] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#f9c74f] uppercase tracking-wider">
                      1. Section Title & Subtitle
                    </h4>
                    <p className="text-xs text-[#a08fd4]">
                      Changes the main title displayed above the vibe pills on the homepage.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveVibeTitle} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Section Title <span className="text-[#f47b5c]">*</span>
                    </label>
                    <input
                      type="text"
                      value={vibeTitleInput}
                      onChange={(e) => setVibeTitleInput(e.target.value)}
                      placeholder="e.g. Today's Campus Vibe"
                      className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-sm font-bold text-[#fff4d6] focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Section Subtitle / Question
                    </label>
                    <input
                      type="text"
                      value={vibeSubtitleInput}
                      onChange={(e) => setVibeSubtitleInput(e.target.value)}
                      placeholder="e.g. Tap what describes your study mood today"
                      className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-xs text-[#fff4d6] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      className="pixel-btn text-xs font-mono"
                    >
                      <Check className="w-4 h-4" />
                      <span>▶ Save Title & Subtitle</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. Current Options List (Edit, Remove, Modify Counts) */}
              <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] space-y-4">
                <div className="pb-3 border-b-2 border-[#4b2f7e] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#f9c74f] uppercase tracking-wider">
                      2. Current Options ({(campusVibeConfig?.options || []).length})
                    </h4>
                    <p className="text-xs text-[#a08fd4]">
                      Edit option labels, change emoji icons, adjust votes, or remove options.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#f9c74f] bg-[#241548] px-2.5 py-1 border border-[#4b2f7e]">
                    Total Votes: {(campusVibeConfig?.options || []).reduce((s, o) => s + (o.count || 0), 0)}
                  </span>
                </div>

                <div className="space-y-3">
                  {(campusVibeConfig?.options || []).map((option, index) => (
                    <div
                      key={option.id}
                      className="p-3.5 border-2 border-[#4b2f7e] bg-[#1a1030]/80 shadow-[2px_2px_0_#060410] flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      {/* Left: Index badge & Icon input */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="w-6 h-6 bg-[#241548] border border-[#4b2f7e] text-[#f9c74f] text-xs font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>

                        {/* Emoji Input */}
                        <input
                          type="text"
                          value={option.icon}
                          onChange={(e) => handleUpdateOption(option.id, { icon: e.target.value })}
                          className="w-10 h-10 text-center text-lg bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white shrink-0 focus:outline-none"
                          title="Change emoji"
                          maxLength={4}
                        />

                        {/* Title Input */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) => handleUpdateOption(option.id, { label: e.target.value })}
                            className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-xs font-bold text-[#fff4d6] focus:outline-none"
                            placeholder="Option Label"
                          />
                        </div>
                      </div>

                      {/* Right: Vote count & Remove Button */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <div className="flex items-center gap-1 bg-[#241548] px-2 py-1 border border-[#4b2f7e] text-xs">
                          <span className="text-[11px] text-[#a08fd4]">Votes:</span>
                          <input
                            type="number"
                            min="0"
                            value={option.count}
                            onChange={(e) =>
                              handleUpdateOption(option.id, { count: Math.max(0, parseInt(e.target.value, 10) || 0) })
                            }
                            className="w-14 text-center font-mono font-bold text-[#f9c74f] bg-transparent focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveOption(option.id, option.label)}
                          className="p-2 text-[#a08fd4] hover:text-[#d34c53] hover:bg-[#d34c53]/20 border border-transparent hover:border-[#d34c53] transition-colors cursor-pointer"
                          title={`Remove "${option.label}"`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Add New Option Form */}
              <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] space-y-4">
                <div className="pb-3 border-b-2 border-[#4b2f7e]">
                  <h4 className="text-sm font-bold text-[#f9c74f] uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#f47b5c]" />
                    <span>3. Add New Vibe Option</span>
                  </h4>
                  <p className="text-xs text-[#a08fd4]">
                    Add a new choice for students to vote on in the live poll.
                  </p>
                </div>

                <form onSubmit={handleAddOption} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                        Option Title / Mood Name <span className="text-[#f47b5c]">*</span>
                      </label>
                      <input
                        type="text"
                        value={newOptionTitle}
                        onChange={(e) => setNewOptionTitle(e.target.value)}
                        placeholder="e.g. Submitting Assignments, Late Night Chai"
                        className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-xs font-bold text-[#fff4d6] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                        Initial Vote Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newOptionInitialCount}
                        onChange={(e) => setNewOptionInitialCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-xs font-mono font-bold text-[#f9c74f] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1.5 uppercase">
                      Choose Emoji Icon (Click any or type custom)
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {['📚', '💻', '☕', '⚡', '🎯', '🚀', '😴', '🍕', '🎮', '🎧', '🏃', '🔥', '💡', '📝', '🏆', '🧠', '🙏', '🎉'].map(
                        (emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setNewOptionEmoji(emoji)}
                            className={`w-9 h-9 border text-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                              newOptionEmoji === emoji
                                ? 'bg-[#f9c74f] text-[#1a1030] border-[#f4e6c8] shadow-[2px_2px_0_#060410] scale-105'
                                : 'bg-[#241548] text-white border-[#4b2f7e] hover:border-[#f9c74f]'
                            }`}
                          >
                            {emoji}
                          </button>
                        )
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#a08fd4]">Selected Emoji:</span>
                      <input
                        type="text"
                        value={newOptionEmoji}
                        onChange={(e) => setNewOptionEmoji(e.target.value)}
                        className="w-12 h-9 text-center text-lg bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-white font-mono"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newOptionTitle.trim()}
                      className="pixel-btn text-xs font-mono disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>▶ Add Option to Live Poll</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Col: Live Interactive Preview Box */}
            <div className="space-y-4">
              <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 shadow-[6px_6px_0_rgba(6,4,16,0.65)] sticky top-20">
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e] mb-4">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#f47b5c]" />
                    <h4 className="text-xs font-bold text-[#f9c74f] uppercase tracking-wider">
                      Live Student Preview
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-[#52b788] bg-[#2d6a4f]/30 px-2 py-0.5 border border-[#52b788]">
                    WYSIWYG
                  </span>
                </div>

                <div className="bg-[#120a22] text-[#f4e6c8] p-4 border-2 border-[#4b2f7e] shadow-[4px_4px_0_#060410] space-y-3 font-mono">
                  <div className="flex items-center justify-between gap-1">
                    <div>
                      <p className="text-xs font-bold text-[#f9c74f] uppercase">
                        ⚡ {vibeTitleInput || "Today's Campus Vibe"}
                      </p>
                      <p className="text-[10px] text-[#a08fd4]">
                        · {vibeSubtitleInput || 'Tap what describes your study mood today'}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#f47b5c] font-mono">
                      {(campusVibeConfig?.options || []).reduce((s, o) => s + (o.count || 0), 0)} votes
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(campusVibeConfig?.options || []).map((opt) => {
                      const total = (campusVibeConfig?.options || []).reduce((s, o) => s + (o.count || 0), 0);
                      const pct = total > 0 ? Math.round((opt.count / total) * 100) : 0;
                      return (
                        <div
                          key={opt.id}
                          className="relative overflow-hidden border border-[#4b2f7e] bg-[#1a1030] p-2.5 text-left text-xs"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-[#f47b5c]/25 pointer-events-none"
                            style={{ width: `${pct}%` }}
                          />
                          <div className="relative z-10 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-medium truncate">
                              <span className="text-sm">{opt.icon}</span>
                              <span className="truncate text-[#fff4d6]">{opt.label}</span>
                            </span>
                            <span className="font-mono text-[#f9c74f] font-bold text-[11px] shrink-0 ml-2">
                              {pct}% ({opt.count})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-[#241548]/80 border border-[#4b2f7e] text-[11px] text-[#b9a7e8] leading-normal font-mono">
                  <p className="font-bold text-[#f9c74f] mb-0.5">Instant Multi-Device Sync:</p>
                  Any changes to options or section title are immediately pushed across all connected phones and laptops without refreshing!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          TAB: SETTINGS & SAFETY
      ----------------------------------------------------------------------- */}
      {activeAdminTab === 'SETTINGS' && (
        <div className="border-2 border-[#4b2f7e]/80 bg-[#150c28]/60 backdrop-blur-xl p-5 sm:p-6 shadow-[6px_6px_0_rgba(6,4,16,0.65)] font-mono space-y-6 max-w-3xl">
          <div className="pb-3 border-b-2 border-[#4b2f7e]">
            <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">System Safety & Portal Controls</h3>
            <p className="text-xs text-[#a08fd4]">Manage developer footer credits, admin security, database backups, and data resets</p>
          </div>

          <div className="space-y-5">
            {/* 1. DEVELOPER FOOTER CREDITS & CONTACT INFO (Requested Feature) */}
            <div className="border-2 border-[#4b2f7e] bg-[#1a1030]/80 p-5 shadow-[4px_4px_0_#060410] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e] flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 border-2 border-[#f4e6c8] bg-[#f47b5c] text-[#1a1030] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#060410]">
                    <Sparkles className="w-4 h-4 text-[#1a1030]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#f9c74f] uppercase tracking-wider">Developer & Contact Info (Bottom Footer)</h4>
                    <p className="text-xs text-[#a08fd4]">Controls the text and contact links displayed at the bottom of the portal</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#2d6a4f]/40 text-[#52b788] border border-[#52b788]">
                  LIVE ON SITE FOOTER
                </span>
              </div>

              {footerSavedToast && (
                <div className="p-3 bg-[#2d6a4f]/25 border-2 border-[#52b788] text-[#52b788] text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0_#060410]">
                  <CheckCircle2 className="w-4 h-4 text-[#52b788] shrink-0" />
                  <span>Developer footer information updated and published across all pages!</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateDeveloperFooterConfig({
                    devName: footerDevName.trim() || 'Priyanshu Gupta',
                    message: footerMessage.trim() || 'If you spot any bug or have some suggestions, connect with me',
                    email: footerEmail.trim() || 'guptapriyanshu0101@gmail.com',
                    instagram: footerInstagram.trim() || '@priyanshu_01928',
                  });
                  setFooterSavedToast(true);
                  showToast('Bottom footer developer credits saved!');
                  setTimeout(() => setFooterSavedToast(false), 3500);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Developer Name <span className="text-[#f47b5c]">*</span>
                    </label>
                    <input
                      type="text"
                      value={footerDevName}
                      onChange={(e) => setFooterDevName(e.target.value)}
                      placeholder="e.g. Priyanshu Gupta"
                      required
                      className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-xs font-bold text-[#fff4d6] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Email Address <span className="text-[#f47b5c]">*</span>
                    </label>
                    <input
                      type="email"
                      value={footerEmail}
                      onChange={(e) => setFooterEmail(e.target.value)}
                      placeholder="e.g. guptapriyanshu0101@gmail.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-xs font-mono text-[#fff4d6] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Instagram Handle <span className="text-[#f47b5c]">*</span>
                    </label>
                    <input
                      type="text"
                      value={footerInstagram}
                      onChange={(e) => setFooterInstagram(e.target.value)}
                      placeholder="e.g. @priyanshu_01928"
                      required
                      className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-xs font-mono text-[#fff4d6] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                      Suggestions / Bug Note Message
                    </label>
                    <input
                      type="text"
                      value={footerMessage}
                      onChange={(e) => setFooterMessage(e.target.value)}
                      placeholder="If you spot any bug or have some suggestions, connect with me"
                      className="w-full px-3.5 py-2.5 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-xs text-[#fff4d6] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="p-4 bg-[#120a22] border-2 border-[#4b2f7e] space-y-1.5 shadow-[2px_2px_0_#060410]">
                  <span className="text-[10px] font-bold text-[#f9c74f] uppercase tracking-wider block">
                    Live Bottom Footer Preview
                  </span>
                  <div className="text-center py-2 space-y-1">
                    <p className="text-xs font-bold text-[#f9c74f] uppercase tracking-wider">
                      Developed by {footerDevName || 'Priyanshu Gupta'}
                    </p>
                    <p className="text-[11px] text-[#a08fd4]">
                      {footerMessage || 'If you spot any bug or have some suggestions, connect with me'}
                    </p>
                    <div className="pt-1 flex items-center justify-center gap-4 text-xs font-mono flex-wrap">
                      <span className="text-[#f4e6c8] flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[#f47b5c]" />
                        <span>{footerEmail || 'guptapriyanshu0101@gmail.com'}</span>
                      </span>
                      <span className="text-[#4b2f7e]">·</span>
                      <span className="text-[#f4e6c8] flex items-center gap-1">
                        <Instagram className="w-3.5 h-3.5 text-[#f47b5c]" />
                        <span>{footerInstagram || '@priyanshu_01928'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="pixel-btn text-xs font-mono"
                  >
                    <Save className="w-4 h-4" />
                    <span>▶ Save Developer & Contact Details</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 2. ADMIN CREDENTIALS & SECURITY */}
            <div className="border-2 border-[#4b2f7e] bg-[#1a1030]/80 p-5 shadow-[4px_4px_0_#060410] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e] flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 border-2 border-[#f4e6c8] bg-[#f9c74f] text-[#1a1030] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#060410]">
                    <Key className="w-4 h-4 text-[#1a1030]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#f9c74f] uppercase tracking-wider">Admin Login Credentials</h4>
                    <p className="text-xs text-[#a08fd4]">Change your administrator username & password anytime</p>
                  </div>
                </div>
                <div className="text-[11px] font-bold px-2.5 py-1 bg-[#241548] text-[#f9c74f] border border-[#4b2f7e]">
                  Current: <span className="font-mono text-white">{adminCredentials.username}</span>
                </div>
              </div>

              {credsMsg && (
                <div
                  className={`p-3 border-2 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0_#060410] ${
                    credsMsg.type === 'success'
                      ? 'bg-[#2d6a4f]/25 text-[#52b788] border-[#52b788]'
                      : 'bg-[#d34c53]/25 text-[#fff4d6] border-[#d34c53]'
                  }`}
                >
                  {credsMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#52b788] shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#f47b5c] shrink-0" />
                  )}
                  <span>{credsMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveAdminCreds} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    Username <span className="text-[#f47b5c]">*</span>
                  </label>
                  <input
                    type="text"
                    value={customUserField}
                    onChange={(e) => setCustomUserField(e.target.value)}
                    placeholder="e.g. priyanshu or admin"
                    required
                    className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-xs font-mono text-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#f4e6c8] mb-1 uppercase">
                    New Password <span className="text-[#f47b5c]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCredPass ? 'text' : 'password'}
                      value={customPassField}
                      onChange={(e) => setCustomPassField(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="w-full px-3 py-2 pr-9 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-xs font-mono text-white focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCredPass(!showCredPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a08fd4] hover:text-[#f9c74f] cursor-pointer"
                    >
                      {showCredPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="submit"
                    disabled={isSavingCreds}
                    className="pixel-btn text-xs font-mono w-full py-2 disabled:opacity-60"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingCreds ? 'Saving...' : 'Save Credentials'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* 3. EXPORT COMPLETE DATABASE JSON */}
            <div className="border-2 border-[#4b2f7e] bg-[#1a1030]/80 p-4 shadow-[4px_4px_0_#060410] space-y-2">
              <h4 className="text-xs font-bold text-[#f9c74f] uppercase tracking-wider">Export Complete Database (JSON)</h4>
              <p className="text-xs text-[#a08fd4]">
                Downloads a full snapshot of all registered students, notes, resources, circulars, and messages. Keep this before making major updates.
              </p>
              <button
                onClick={exportDatabaseBackup}
                className="pixel-btn-secondary text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Database JSON</span>
              </button>
            </div>

            {/* 4. SYSTEM RESTORES & RESETS */}
            <div className="border-2 border-[#4b2f7e] bg-[#1a1030]/80 p-4 shadow-[4px_4px_0_#060410] space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#f9c74f] uppercase tracking-wider">Database & System Reset Controls</h4>
                <p className="text-xs text-[#a08fd4]">Perform diagnostic resets or restore default batch states</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Reset 1: Default Demo Batch */}
                <div className="p-3 bg-[#241548]/70 border border-[#4b2f7e] space-y-2">
                  <h5 className="text-xs font-bold text-[#f4e6c8]">1. Restore Demo State</h5>
                  <p className="text-[11px] text-[#a08fd4]">
                    Restores official starting dataset with default students and circulars.
                  </p>
                  <button
                    disabled={Boolean(isResetting)}
                    onClick={async () => {
                      setIsResetting('default');
                      const res = await resetData('default');
                      setIsResetting(null);
                      showToast(res.message);
                    }}
                    className="pixel-btn text-xs py-1 px-3 w-full"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResetting === 'default' ? 'animate-spin' : ''}`} />
                    <span>Restore Demo</span>
                  </button>
                </div>

                {/* Reset 2: Reset Likes */}
                <div className="p-3 bg-[#241548]/70 border border-[#4b2f7e] space-y-2">
                  <h5 className="text-xs font-bold text-[#f4e6c8]">2. Reset Student Likes</h5>
                  <p className="text-[11px] text-[#a08fd4]">
                    Sets all likes back to 0 without deleting student accounts.
                  </p>
                  <button
                    disabled={Boolean(isResetting)}
                    onClick={async () => {
                      setIsResetting('likes');
                      await resetAllLikes();
                      setIsResetting(null);
                      showToast('All student likes have been reset to 0!');
                    }}
                    className="pixel-btn-secondary text-xs py-1 px-3 w-full"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isResetting === 'likes' ? 'animate-ping' : ''}`} />
                    <span>Reset Likes to 0</span>
                  </button>
                </div>

                {/* Reset 3: Reset Campus Vibe Poll */}
                <div className="p-3 bg-[#241548]/70 border border-[#4b2f7e] space-y-2">
                  <h5 className="text-xs font-bold text-[#f4e6c8]">3. Reset Vibe Poll</h5>
                  <p className="text-[11px] text-[#a08fd4]">
                    Resets daily vibe mood vote counts back to 0 for a fresh day.
                  </p>
                  <button
                    disabled={Boolean(isResetting)}
                    onClick={async () => {
                      setIsResetting('vibe');
                      await resetCampusVibePoll();
                      setIsResetting(null);
                      showToast('All Campus Vibe poll vote counts have been reset to 0!');
                    }}
                    className="pixel-btn-secondary text-xs py-1 px-3 w-full"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResetting === 'vibe' ? 'animate-spin' : ''}`} />
                    <span>Reset Poll Votes</span>
                  </button>
                </div>
              </div>

              {/* Reset 4: Wipe Clean */}
              <div className="p-3 bg-[#d34c53]/15 border-2 border-[#d34c53] space-y-2">
                <h5 className="text-xs font-bold text-[#fff4d6] uppercase">4. Hard Wipe Database (Clean Launch Slate)</h5>
                <p className="text-[11px] text-[#b9a7e8]">
                  Clears all students (0 members), notes, circulars, and chat messages across client and server.
                </p>
                {!confirmWipeActive ? (
                  <button
                    disabled={Boolean(isResetting)}
                    onClick={() => setConfirmWipeActive(true)}
                    className="pixel-btn-crimson text-xs py-1.5 px-3"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Wipe All Data Clean (0 Members)</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <button
                      disabled={Boolean(isResetting)}
                      onClick={async () => {
                        setIsResetting('wipe');
                        const res = await resetData('wipe');
                        setIsResetting(null);
                        setConfirmWipeActive(false);
                        showToast(res.message);
                      }}
                      className="pixel-btn-crimson text-xs py-1.5 px-3 animate-pulse"
                    >
                      <Trash2 className={`w-3.5 h-3.5 ${isResetting === 'wipe' ? 'animate-spin' : ''}`} />
                      <span>⚠️ Confirm Permanent Wipe</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmWipeActive(false)}
                      className="pixel-btn-secondary text-xs py-1.5 px-3"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          MODAL: EDIT STUDENT PROFILE
      ----------------------------------------------------------------------- */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060410]/80 backdrop-blur-md font-mono">
          <div className="border-2 border-[#f4e6c8]/85 bg-[#150c28]/95 backdrop-blur-xl p-6 shadow-[8px_8px_0_#060410] w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#4b2f7e]">
              <h3 className="text-base font-bold text-[#f9c74f] uppercase tracking-wider">
                Edit Student Profile: {editingStudent.name}
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 text-[#a08fd4] hover:text-[#f47b5c] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentEdit} className="space-y-3.5 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">Roll Number</label>
                  <input
                    type="number"
                    value={editingStudent.rollNumber}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rollNumber: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={editingStudent.phoneNumber}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">Email</label>
                  <input
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">Tech Interests (comma-separated)</label>
                <input
                  type="text"
                  value={editingStudent.techInterest}
                  onChange={(e) => setEditingStudent({ ...editingStudent, techInterest: e.target.value })}
                  placeholder="e.g. Python, Machine Learning"
                  className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">About Me / Bio</label>
                <textarea
                  rows={2}
                  value={editingStudent.description}
                  onChange={(e) => setEditingStudent({ ...editingStudent, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">Role</label>
                  <select
                    value={editingStudent.role}
                    onChange={(e) => setEditingStudent({ ...editingStudent, role: e.target.value as StudentRole })}
                    className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] focus:outline-none"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.role} value={r.role}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#f4e6c8] mb-1 uppercase">Account Status</label>
                  <select
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#241548] border-2 border-[#4b2f7e] focus:border-[#f9c74f] text-[#fff4d6] focus:outline-none"
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                    <option value="DISMISSED">DISMISSED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t-2 border-[#4b2f7e]">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="pixel-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pixel-btn text-xs font-mono"
                >
                  ▶ Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
