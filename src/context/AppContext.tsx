import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  StudentProfile,
  NoteRequest,
  ResourceItem,
  NoticeItem,
  ChatMessage,
  StudentRole,
  NoteFulfillment,
  CampusVibeConfig,
  CampusVibeOption,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_NOTE_REQUESTS,
  INITIAL_RESOURCES,
  INITIAL_NOTICES,
  INITIAL_CHAT,
} from '../data/seedData';
import { getBatchFromRoll } from '../utils/studentUtils';
import { soundEngine } from '../utils/soundEffects';

export interface UnreadBadges {
  notices: number;
  chat: number;
  resources: number;
  notes: number;
}

export interface DeveloperFooterConfig {
  devName: string;
  message: string;
  email: string;
  instagram: string;
}

interface AppContextType {
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Fire Noise Sound (Synchronized with firing pixel animation)
  isFireSoundActive: boolean;
  toggleFireSound: () => void;

  // Developer Footer Credits (Configurable from Admin Panel)
  developerFooterConfig: DeveloperFooterConfig;
  updateDeveloperFooterConfig: (config: Partial<DeveloperFooterConfig>) => void;

  // Campus Vibe
  campusVibeConfig: CampusVibeConfig;
  updateCampusVibeConfig: (config: { title?: string; subtitle?: string; options?: CampusVibeOption[] }) => Promise<void>;
  voteCampusVibe: (optionId: string, previousOptionId?: string) => Promise<void>;

  // Campus Streak
  campusStreak: number;
  incrementCampusStreak: () => Promise<void>;

  students: StudentProfile[];
  currentUser: StudentProfile | null;
  setCurrentUser: (user: StudentProfile | null) => void;
  noteRequests: NoteRequest[];
  resources: ResourceItem[];
  notices: NoticeItem[];
  chatMessages: ChatMessage[];
  unreadBadges: UnreadBadges;
  clearTabBadge: (tab: 'NOTICES' | 'CHAT' | 'RESOURCES' | 'NOTES') => void;
  
  // Registration & Approval & Management
  registerStudent: (data: Omit<StudentProfile, 'id' | 'status' | 'likes' | 'dislikes' | 'likedBy' | 'dislikedBy' | 'createdAt' | 'batch'>) => { success: boolean; message: string };
  approveStudent: (studentId: string, assignedRole: StudentRole) => void;
  dismissStudent: (studentId: string) => void;
  deleteStudent: (studentId: string) => void;
  updateStudentProfile: (studentId: string, updates: Partial<StudentProfile>) => void;
  
  // Likes / Dislikes & Cheat
  likeStudent: (studentId: string) => { success: boolean; message?: string };
  dislikeStudent: (studentId: string) => { success: boolean; message?: string };
  boostStudentLikes: (studentId: string, amount: number) => void;
  setStudentLikes: (studentId: string, likes: number) => void;

  // Student Login & Logout
  loginStudent: (identifier: string, password?: string) => { success: boolean; message: string };
  logoutStudent: () => void;

  // Admin Access Gate
  isAdminUnlocked: boolean;
  unlockAdmin: (userId: string, accessCode: string) => { success: boolean; message: string };
  lockAdmin: () => void;
  adminCredentials: { username: string; password: string };
  updateAdminCredentials: (newUsername: string, newPassword: string) => Promise<{ success: boolean; message: string }>;

  // Notes
  createNoteRequest: (title: string, subject: string, topic: string, urgency: 'Normal' | 'High' | 'Exam Tomorrow') => void;
  fulfillNoteRequest: (requestId: string, fulfillment: Omit<NoteFulfillment, 'id' | 'createdAt' | 'upvotes'>) => void;
  deleteNoteRequest: (requestId: string) => void;
  uploadAdminNote: (note: {
    title: string;
    subject: string;
    topic: string;
    urgency?: 'Normal' | 'High' | 'Exam Tomorrow';
    comment?: string;
    fileName?: string;
    fileSize?: string;
    fileType?: 'pdf' | 'image' | 'doc' | 'link';
    fileUrl?: string;
    alsoAddToResources?: boolean;
    resourceCategory?: ResourceItem['category'];
  }) => void;

  // Resources
  uploadResource: (resource: Omit<ResourceItem, 'id' | 'uploadedAt' | 'downloads' | 'verified'>) => void;
  deleteResource: (resourceId: string) => void;

  // Notices & Announcements
  postNotice: (
    title: string,
    content: string,
    category: NoticeItem['category'],
    extra?: {
      attachmentUrl?: string;
      pinned?: boolean;
      authorName?: string;
      authorDesignation?: string;
    }
  ) => void;
  approveNotice: (noticeId: string) => void;
  dismissNotice: (noticeId: string) => void;
  deleteNotice: (noticeId: string) => void;

  // Chat
  sendChatMessage: (content: string, replyTo?: { id: string; authorName: string; text: string }) => void;
  addChatReaction: (messageId: string, emoji: string) => void;

  // Modals & Navigation
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: (open: boolean) => void;
  viewingStudent: StudentProfile | null;
  setViewingStudent: (student: StudentProfile | null) => void;
  isPersonalDetailsOpen: boolean;
  setIsPersonalDetailsOpen: (open: boolean) => void;

  // Helpers
  resetData: (mode?: 'default' | 'wipe' | 'likes' | 'vibe') => Promise<{ success: boolean; message: string }>;
  resetAllLikes: () => Promise<void>;
  resetCampusVibePoll: () => Promise<void>;
  exportDatabaseBackup: () => void;
  isRealtimeConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Students (persisted in localStorage + real-time server database)
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    try {
      if (localStorage.getItem('nexusit_db_wiped') === 'true') {
        return [];
      }
      const saved = localStorage.getItem('nexusit_portal_students_live');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<StudentProfile | null>(() => {
    try {
      const savedId = localStorage.getItem('nexusit_portal_user_id_live');
      if (!savedId || savedId === 'GUEST') return null;
      const found = students.find((s) => s.id === savedId);
      return found || null;
    } catch {
      return null;
    }
  });

  // Note Requests
  const [noteRequests, setNoteRequests] = useState<NoteRequest[]>(() => {
    try {
      const saved = localStorage.getItem('nexusit_portal_note_requests_live');
      return saved ? JSON.parse(saved) : INITIAL_NOTE_REQUESTS;
    } catch {
      return [];
    }
  });

  // Resources
  const [resources, setResources] = useState<ResourceItem[]>(() => {
    try {
      const saved = localStorage.getItem('nexusit_portal_resources_live');
      return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
    } catch {
      return [];
    }
  });

  // Notices
  const [notices, setNotices] = useState<NoticeItem[]>(() => {
    try {
      const saved = localStorage.getItem('nexusit_portal_notices_live');
      return saved ? JSON.parse(saved) : INITIAL_NOTICES;
    } catch {
      return [];
    }
  });

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('nexusit_portal_chat_live');
      return saved ? JSON.parse(saved) : INITIAL_CHAT;
    } catch {
      return [];
    }
  });

  // Real-time unread bubble indicators
  const [unreadBadges, setUnreadBadges] = useState<UnreadBadges>(() => {
    try {
      const saved = localStorage.getItem('nexusit_unread_badges_live');
      return saved ? JSON.parse(saved) : { notices: 0, chat: 0, resources: 0, notes: 0 };
    } catch {
      return { notices: 0, chat: 0, resources: 0, notes: 0 };
    }
  });

  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  // --------------------------------------------------------------------------
  // Theme State (Strictly locked to dark for Firing Pixel Matrix shader theme)
  // --------------------------------------------------------------------------
  const [theme] = useState<'dark' | 'light'>('dark');
  const toggleTheme = () => {
    // Locked to dark theme for Firing Pixel Matrix animation
  };

  useEffect(() => {
    try {
      localStorage.setItem('nexusit_theme', 'dark');
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.body.classList.remove('bg-[#F8FAFC]', 'text-slate-900');
        document.body.classList.add('bg-[#070A11]', 'text-slate-100');
      }
    } catch {}
  }, []);

  // --------------------------------------------------------------------------
  // Fire Sound State & Platform-Scoped Audio Controller
  // Sound strictly stops when user switches tabs, goes home, or leaves website
  // --------------------------------------------------------------------------
  const [isFireSoundActive, setIsFireSoundActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nexusit_fire_sound_active') === 'true';
    } catch {
      return false;
    }
  });

  const toggleFireSound = () => {
    setIsFireSoundActive((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nexusit_fire_sound_active', String(next));
      } catch {}
      if (next && !document.hidden) {
        soundEngine.startFireAmbient();
      } else {
        soundEngine.stopFireAmbient();
      }
      return next;
    });
  };

  useEffect(() => {
    if (isFireSoundActive && !document.hidden) {
      soundEngine.startFireAmbient();
    } else {
      soundEngine.stopFireAmbient();
    }
  }, [isFireSoundActive]);

  // Strict Page Visibility & Window Lifecycle listeners
  // Ensures fire sound ONLY plays when the user is actively on this platform
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Paused immediately when switching to another tab or minimizing to home screen
        soundEngine.stopFireAmbient();
      } else if (isFireSoundActive) {
        // Resumes when returning to this website if user had sound enabled
        soundEngine.startFireAmbient();
      }
    };

    const handleWindowBlur = () => {
      // If user clicks outside or switches apps on mobile
      if (document.hidden) {
        soundEngine.stopFireAmbient();
      }
    };

    const handleWindowFocus = () => {
      if (isFireSoundActive && !document.hidden) {
        soundEngine.startFireAmbient();
      }
    };

    const handleCleanup = () => {
      soundEngine.stopFireAmbient();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('pagehide', handleCleanup);
    window.addEventListener('beforeunload', handleCleanup);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('pagehide', handleCleanup);
      window.removeEventListener('beforeunload', handleCleanup);
      soundEngine.stopFireAmbient();
    };
  }, [isFireSoundActive]);

  // --------------------------------------------------------------------------
  // Developer Credits / Bottom Footer (Configurable from Admin Panel)
  // --------------------------------------------------------------------------
  const DEFAULT_FOOTER_CONFIG: DeveloperFooterConfig = {
    devName: 'Priyanshu Gupta',
    message: 'If you spot any bug or have some suggestions, connect with me',
    email: 'guptapriyanshu0101@gmail.com',
    instagram: '@priyanshu_01928',
  };

  const [developerFooterConfig, setDeveloperFooterConfig] = useState<DeveloperFooterConfig>(() => {
    try {
      const saved = localStorage.getItem('nexusit_footer_credits');
      if (saved) {
        return { ...DEFAULT_FOOTER_CONFIG, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_FOOTER_CONFIG;
  });

  const updateDeveloperFooterConfig = (updates: Partial<DeveloperFooterConfig>) => {
    setDeveloperFooterConfig((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('nexusit_footer_credits', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // --------------------------------------------------------------------------
  // Campus Vibe State & Methods
  // --------------------------------------------------------------------------
  const DEFAULT_CAMPUS_VIBE: CampusVibeConfig = {
    title: "Today's Campus Vibe",
    subtitle: "Tap what describes your study mood today",
    options: [
      { id: 'grind', label: 'Midsem / Exam Grind', icon: '📚', count: 28 },
      { id: 'hack', label: 'Coding & Projects', icon: '💻', count: 19 },
      { id: 'canteen', label: 'Canteen & Chill', icon: '☕', count: 14 },
      { id: 'lab', label: 'Lab Submissions', icon: '⚡', count: 23 },
    ],
  };

  const [campusVibeConfig, setCampusVibeConfig] = useState<CampusVibeConfig>(() => {
    try {
      const saved = localStorage.getItem('nexusit_campus_vibe_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CAMPUS_VIBE;
  });

  useEffect(() => {
    try {
      localStorage.setItem('nexusit_campus_vibe_config', JSON.stringify(campusVibeConfig));
    } catch {}
  }, [campusVibeConfig]);

  const updateCampusVibeConfig = async (newConfig: { title?: string; subtitle?: string; options?: CampusVibeOption[] }) => {
    setCampusVibeConfig((prev) => ({
      title: newConfig.title !== undefined && newConfig.title.trim() ? newConfig.title.trim() : prev.title,
      subtitle: newConfig.subtitle !== undefined ? newConfig.subtitle.trim() : prev.subtitle,
      options: newConfig.options || prev.options,
    }));

    try {
      const res = await fetch('/api/vibe', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (data.vibeConfig) {
        setCampusVibeConfig(data.vibeConfig);
      }
    } catch (err) {
      console.error('Error saving campus vibe to server:', err);
    }
  };

  const voteCampusVibe = async (optionId: string, previousOptionId?: string) => {
    soundEngine.playVibePop();
    setCampusVibeConfig((prev) => ({
      ...prev,
      options: prev.options.map((opt) => {
        if (opt.id === optionId) return { ...opt, count: opt.count + 1 };
        if (previousOptionId && opt.id === previousOptionId) return { ...opt, count: Math.max(0, opt.count - 1) };
        return opt;
      }),
    }));

    try {
      const res = await fetch('/api/vibe/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId, previousOptionId }),
      });
      const data = await res.json();
      if (data.vibeConfig) {
        setCampusVibeConfig(data.vibeConfig);
      }
    } catch (err) {
      console.error('Error voting on campus vibe:', err);
    }
  };

  // --------------------------------------------------------------------------
  // Campus Study Streak State & Methods
  // --------------------------------------------------------------------------
  const [campusStreak, setCampusStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexusit_campus_streak');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nexusit_campus_streak', String(campusStreak));
    } catch {}
  }, [campusStreak]);

  const incrementCampusStreak = async () => {
    soundEngine.playStreakIgnite();
    setCampusStreak((prev) => prev + 1);

    if (currentUser) {
      const today = new Date().toISOString().slice(0, 10);
      const newStreak = (currentUser.streak || 0) + 1;
      const longest = Math.max(currentUser.longestStreak || 0, newStreak);
      const updatedUser = {
        ...currentUser,
        streak: newStreak,
        longestStreak: longest,
        lastActiveDate: today,
      };
      setCurrentUser(updatedUser);
      setStudents((prev) => prev.map((s) => (s.id === currentUser.id ? updatedUser : s)));
    }

    try {
      const res = await fetch('/api/campus-streak/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: currentUser?.id }),
      });
      const data = await res.json();
      if (typeof data.campusStreak === 'number') {
        setCampusStreak(data.campusStreak);
      }
    } catch (err) {
      console.error('Error incrementing campus streak:', err);
    }
  };

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<StudentProfile | null>(null);
  const [isPersonalDetailsOpen, setIsPersonalDetailsOpen] = useState(false);

  // Keep ref of currentUser to prevent stale closures in async sync handlers
  const currentUserRef = useRef<StudentProfile | null>(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Sync to local storage
  useEffect(() => {
    if (students && students.length > 0) {
      localStorage.setItem('nexusit_portal_students_live', JSON.stringify(students));
      localStorage.removeItem('nexusit_db_wiped');
    } else if (students && students.length === 0) {
      localStorage.removeItem('nexusit_portal_students_live');
      localStorage.removeItem('nexusit_students_permanent_backup');
      localStorage.removeItem('nexusit_students');
      localStorage.removeItem('nexusit_portal_students');
      localStorage.removeItem('nexusit_live_portal_students_v1');
    }
  }, [students]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nexusit_portal_user_id_live', currentUser.id);
    } else {
      localStorage.setItem('nexusit_portal_user_id_live', 'GUEST');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nexusit_portal_note_requests_live', JSON.stringify(noteRequests));
  }, [noteRequests]);

  useEffect(() => {
    localStorage.setItem('nexusit_portal_resources_live', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('nexusit_portal_notices_live', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('nexusit_portal_chat_live', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('nexusit_unread_badges_live', JSON.stringify(unreadBadges));
  }, [unreadBadges]);

  const clearTabBadge = (tab: 'NOTICES' | 'CHAT' | 'RESOURCES' | 'NOTES') => {
    setUnreadBadges((prev) => {
      const key = tab.toLowerCase() as keyof UnreadBadges;
      if (prev[key] === 0) return prev;
      return { ...prev, [key]: 0 };
    });
  };

  // Sync with current user profile if students list updates
  useEffect(() => {
    if (currentUser) {
      const updatedUser = students.find((s) => s.id === currentUser.id);
      if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(updatedUser);
      }
    }
  }, [students, currentUser]);

  // --------------------------------------------------------------------------
  // Multi-Device Real-Time Sync & Server-Sent Events (SSE)
  // --------------------------------------------------------------------------
  useEffect(() => {
    // 1. Initial State Fetch from backend
    const fetchDatabase = async () => {
      try {
        const getRes = await fetch('/api/database');
        if (!getRes.ok) return;
        const data = await getRes.json();

        if (data && Array.isArray(data.students)) {
          setStudents(data.students);

          // If user is currently logged in, sync their profile
          const savedId = localStorage.getItem('nexusit_portal_user_id_live');
          if (savedId && savedId !== 'GUEST') {
            const matched = data.students.find((s: StudentProfile) => s.id === savedId);
            if (matched) {
              setCurrentUser(matched);
            } else {
              setCurrentUser(null);
              localStorage.setItem('nexusit_portal_user_id_live', 'GUEST');
            }
          }
        } else {
          setStudents([]);
        }

        if (data && Array.isArray(data.noteRequests)) setNoteRequests(data.noteRequests);
        if (data && Array.isArray(data.resources)) setResources(data.resources);
        if (data && Array.isArray(data.notices)) setNotices(data.notices);
        if (data && Array.isArray(data.chatMessages)) setChatMessages(data.chatMessages);
        if (data && data.campusVibeConfig && Array.isArray(data.campusVibeConfig.options)) {
          setCampusVibeConfig(data.campusVibeConfig);
        }
        if (typeof data.campusStreak === 'number') {
          setCampusStreak(data.campusStreak);
        }
      } catch (err) {
        console.warn('Initial fetch from server database skipped or offline:', err);
      }
    };

    fetchDatabase();

    // 2. Establish SSE Real-Time Stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/realtime/stream');

      eventSource.addEventListener('connected', () => {
        setIsRealtimeConnected(true);
      });

      eventSource.addEventListener('STUDENT_UPDATED', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.database?.students) {
            setStudents(payload.database.students);
          } else if (payload.student) {
            setStudents((prev) => {
              const exists = prev.some((s) => s.id === payload.student.id);
              if (exists) {
                return prev.map((s) => (s.id === payload.student.id ? payload.student : s));
              }
              return [payload.student, ...prev];
            });
          }
        } catch (err) {
          console.error('Error handling STUDENT_UPDATED SSE event:', err);
        }
      });

      eventSource.addEventListener('STUDENT_DELETED', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setStudents((prev) => prev.filter((s) => s.id !== payload.id));
          if (currentUserRef.current?.id === payload.id) {
            setCurrentUser(null);
            localStorage.setItem('nexusit_portal_user_id_live', 'GUEST');
          }
        } catch (err) {
          console.error('Error handling STUDENT_DELETED SSE event:', err);
        }
      });

      eventSource.addEventListener('NOTICE_CREATED', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.database?.notices) {
            setNotices(payload.database.notices);
          } else if (payload.notice) {
            setNotices((prev) => [payload.notice, ...prev.filter((n) => n.id !== payload.notice.id)]);
          }
          // Increment notices bubble badge
          setUnreadBadges((prev) => ({ ...prev, notices: prev.notices + 1 }));
        } catch (err) {
          console.error('Error handling NOTICE_CREATED SSE event:', err);
        }
      });

      eventSource.addEventListener('NOTICE_UPDATED', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.database?.notices) {
            setNotices(payload.database.notices);
          } else if (payload.notice) {
            setNotices((prev) => prev.map((n) => (n.id === payload.notice.id ? payload.notice : n)));
          }
          // If approved, trigger notice bubble so other devices know
          if (payload.notice?.status === 'APPROVED') {
            setUnreadBadges((prev) => ({ ...prev, notices: prev.notices + 1 }));
          }
        } catch (err) {
          console.error('Error handling NOTICE_UPDATED SSE event:', err);
        }
      });

      eventSource.addEventListener('NOTICE_DELETED', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setNotices((prev) => prev.filter((n) => n.id !== payload.id));
        } catch (err) {
          console.error('Error handling NOTICE_DELETED SSE event:', err);
        }
      });

      eventSource.addEventListener('RESOURCE_CREATED', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.database?.resources) {
            setResources(payload.database.resources);
          } else if (payload.resource) {
            setResources((prev) => [payload.resource, ...prev.filter((r) => r.id !== payload.resource.id)]);
          }
          // Increment resources bubble badge
          setUnreadBadges((prev) => ({ ...prev, resources: prev.resources + 1 }));
        } catch (err) {
          console.error('Error handling RESOURCE_CREATED SSE event:', err);
        }
      });

      eventSource.addEventListener('RESOURCE_DELETED', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setResources((prev) => prev.filter((r) => r.id !== payload.id));
        } catch (err) {
          console.error('Error handling RESOURCE_DELETED SSE event:', err);
        }
      });

      eventSource.addEventListener('NOTE_REQUEST_CREATED', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.database?.noteRequests) {
            setNoteRequests(payload.database.noteRequests);
          } else if (payload.noteRequest) {
            setNoteRequests((prev) => [payload.noteRequest, ...prev.filter((nr) => nr.id !== payload.noteRequest.id)]);
          }
          // Increment notes bubble badge
          setUnreadBadges((prev) => ({ ...prev, notes: prev.notes + 1 }));
        } catch (err) {
          console.error('Error handling NOTE_REQUEST_CREATED SSE event:', err);
        }
      });

      eventSource.addEventListener('NOTE_FULFILLED', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.database?.noteRequests) {
            setNoteRequests(payload.database.noteRequests);
          } else if (payload.requestId && payload.fulfillment) {
            setNoteRequests((prev) =>
              prev.map((nr) =>
                nr.id === payload.requestId
                  ? {
                      ...nr,
                      fulfilled: true,
                      fulfillments: [payload.fulfillment, ...(nr.fulfillments || [])],
                    }
                  : nr
              )
            );
          }
          // Increment notes bubble badge
          setUnreadBadges((prev) => ({ ...prev, notes: prev.notes + 1 }));
        } catch (err) {
          console.error('Error handling NOTE_FULFILLED SSE event:', err);
        }
      });

      eventSource.addEventListener('NOTE_DELETED', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setNoteRequests((prev) => prev.filter((nr) => nr.id !== payload.id));
        } catch (err) {
          console.error('Error handling NOTE_DELETED SSE event:', err);
        }
      });

      eventSource.addEventListener('CHAT_MESSAGE_CREATED', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.database?.chatMessages) {
            setChatMessages(payload.database.chatMessages);
          } else if (payload.message) {
            setChatMessages((prev) => [...prev, payload.message]);
          }
          // Increment chat bubble badge
          setUnreadBadges((prev) => ({ ...prev, chat: prev.chat + 1 }));
        } catch (err) {
          console.error('Error handling CHAT_MESSAGE_CREATED SSE event:', err);
        }
      });

      eventSource.addEventListener('CHAT_REACTION_UPDATED', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === payload.messageId ? { ...m, reactions: payload.reactions } : m
            )
          );
        } catch (err) {
          console.error('Error handling CHAT_REACTION_UPDATED SSE event:', err);
        }
      });

      eventSource.addEventListener('CAMPUS_STREAK_UPDATED', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (typeof payload.campusStreak === 'number') {
            setCampusStreak(payload.campusStreak);
          }
          if (payload.database?.students) {
            setStudents(payload.database.students);
          }
        } catch (err) {
          console.error('Error handling CAMPUS_STREAK_UPDATED SSE event:', err);
        }
      });

      eventSource.addEventListener('DATABASE_RESET', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.database) {
            setStudents(payload.database.students || []);
            setNoteRequests(payload.database.noteRequests || []);
            setResources(payload.database.resources || []);
            setNotices(payload.database.notices || []);
            setChatMessages(payload.database.chatMessages || []);
            setCampusStreak(payload.database.campusStreak ?? 0);
            if (payload.database.campusVibeConfig) {
              setCampusVibeConfig(payload.database.campusVibeConfig);
            }
          } else {
            setStudents([]);
            setNoteRequests([]);
            setResources([]);
            setNotices([]);
            setChatMessages([]);
            setCampusStreak(0);
          }
          localStorage.setItem('nexusit_campus_streak', '0');
          localStorage.removeItem('nexusit_today_vibe');
          window.dispatchEvent(new CustomEvent('campus-vibe-reset'));
          if (payload.mode === 'wipe') {
            localStorage.setItem('nexusit_db_wiped', 'true');
            setCurrentUser(null);
          } else {
            localStorage.removeItem('nexusit_db_wiped');
          }
        } catch (err) {
          console.error('Error handling DATABASE_RESET SSE:', err);
        }
      });

      eventSource.addEventListener('STUDENTS_UPDATED', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          const studentList = payload.students || payload.database?.students;
          if (Array.isArray(studentList)) {
            setStudents(studentList);
            try {
              localStorage.setItem('nexusit_portal_students_live', JSON.stringify(studentList));
            } catch {}
            if (currentUserRef.current) {
              const updatedSelf = studentList.find((s: StudentProfile) => s.id === currentUserRef.current?.id);
              if (updatedSelf) {
                setCurrentUser(updatedSelf);
              }
            }
          }
        } catch (err) {
          console.error('Error handling STUDENTS_UPDATED SSE event:', err);
        }
      });

      eventSource.addEventListener('LIKES_RESET', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          const studentList = payload.students || payload.database?.students;
          if (Array.isArray(studentList)) {
            setStudents(studentList);
            try {
              localStorage.setItem('nexusit_portal_students_live', JSON.stringify(studentList));
            } catch {}
            if (currentUserRef.current) {
              const updatedSelf = studentList.find((s: StudentProfile) => s.id === currentUserRef.current?.id);
              if (updatedSelf) {
                setCurrentUser(updatedSelf);
              }
            }
          }
        } catch (err) {
          console.error('Error handling LIKES_RESET SSE event:', err);
        }
      });

      eventSource.addEventListener('VIBE_CONFIG_UPDATED', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.vibeConfig) {
            setCampusVibeConfig(payload.vibeConfig);
            const allZero = (payload.vibeConfig.options || []).length > 0 &&
              (payload.vibeConfig.options || []).every((o: any) => (o.count || 0) === 0);
            if (allZero) {
              try {
                localStorage.removeItem('nexusit_today_vibe');
              } catch {}
              window.dispatchEvent(new CustomEvent('campus-vibe-reset'));
            }
          }
        } catch (err) {
          console.error('Error handling VIBE_CONFIG_UPDATED SSE event:', err);
        }
      });

      eventSource.addEventListener('VIBE_RESET', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.vibeConfig) {
            setCampusVibeConfig(payload.vibeConfig);
          }
          try {
            localStorage.removeItem('nexusit_today_vibe');
          } catch {}
          window.dispatchEvent(new CustomEvent('campus-vibe-reset'));
        } catch (err) {
          console.error('Error handling VIBE_RESET SSE event:', err);
        }
      });

      eventSource.addEventListener('VIBE_VOTED', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.vibeConfig) {
            setCampusVibeConfig(payload.vibeConfig);
          }
        } catch (err) {
          console.error('Error handling VIBE_VOTED SSE event:', err);
        }
      });

      eventSource.onerror = () => {
        setIsRealtimeConnected(false);
      };
    } catch (e) {
      console.warn('SSE not initialized:', e);
    }

    // 3. Periodic Background Sync Polling (every 2.5 seconds for instant multi-device resilience)
    const pollInterval = setInterval(() => {
      fetch('/api/database')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) return;
          if (Array.isArray(data.students)) {
            setStudents(data.students);
            if (currentUserRef.current) {
              const updatedSelf = data.students.find((s: StudentProfile) => s.id === currentUserRef.current?.id);
              if (updatedSelf) setCurrentUser(updatedSelf);
            }
          }
          if (Array.isArray(data.noteRequests)) setNoteRequests(data.noteRequests);
          if (Array.isArray(data.resources)) setResources(data.resources);
          if (Array.isArray(data.notices)) setNotices(data.notices);
          if (Array.isArray(data.chatMessages)) setChatMessages(data.chatMessages);
          if (data.campusVibeConfig && Array.isArray(data.campusVibeConfig.options)) {
            setCampusVibeConfig(data.campusVibeConfig);
            const allZero = data.campusVibeConfig.options.length > 0 &&
              data.campusVibeConfig.options.every((o: any) => (o.count || 0) === 0);
            if (allZero) {
              try {
                localStorage.removeItem('nexusit_today_vibe');
              } catch {}
              window.dispatchEvent(new CustomEvent('campus-vibe-reset'));
            }
          }
        })
        .catch(() => {});
    }, 2500);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, []);

  // --------------------------------------------------------------------------
  // Actions with Optimistic UI + Server-Side Real-Time Broadcasting
  // --------------------------------------------------------------------------
  const registerStudent = (
    data: Omit<
      StudentProfile,
      'id' | 'status' | 'likes' | 'dislikes' | 'likedBy' | 'dislikedBy' | 'createdAt' | 'batch'
    >
  ) => {
    const existing = students.find(
      (s) => s.rollNumber === data.rollNumber || s.email.toLowerCase() === data.email.toLowerCase()
    );
    if (existing && existing.status === 'APPROVED') {
      return {
        success: false,
        message: `An approved student already exists with Roll Number ${data.rollNumber} or email ${data.email}.`,
      };
    }
    if (existing && existing.status === 'PENDING_APPROVAL') {
      return {
        success: false,
        message: `A registration request for Roll Number ${data.rollNumber} is already submitted and pending admin verification.`,
      };
    }

    const newStudent: StudentProfile = {
      ...data,
      id: existing ? existing.id : `std_${Date.now()}`,
      batch: getBatchFromRoll(data.rollNumber),
      status: 'PENDING_APPROVAL',
      role: 'STUDENT',
      isAdmin: false,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
      createdAt: new Date().toISOString(),
    };

    if (existing) {
      setStudents((prev) => prev.map((s) => (s.id === existing.id ? newStudent : s)));
    } else {
      setStudents((prev) => [newStudent, ...prev]);
    }

    // Notice: Do NOT set as currentUser. Profile must be approved by admin before login.

    // Broadcast to server so Admin Panel receives it in real-time
    fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent),
    }).catch((err) => console.error('Error posting student to server:', err));

    return {
      success: true,
      message: 'Registration submitted! Your profile has been sent to the Admin for approval.',
    };
  };

  const approveStudent = (studentId: string, assignedRole: StudentRole) => {
    const isAdmin = assignedRole === 'DEVELOPER_ADMIN';
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const updated: StudentProfile = {
            ...s,
            status: 'APPROVED',
            role: assignedRole,
            isAdmin,
          };
          if (currentUser?.id === studentId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return s;
      })
    );

    fetch(`/api/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED', role: assignedRole, isAdmin }),
    }).catch((err) => console.error('Error approving student:', err));
  };

  const dismissStudent = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: 'DISMISSED' } : s))
    );

    fetch(`/api/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DISMISSED' }),
    }).catch((err) => console.error('Error dismissing student:', err));
  };

  const deleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    if (currentUser?.id === studentId) {
      setCurrentUser(null);
      localStorage.setItem('nexusit_portal_user_id_live', 'GUEST');
    }
    if (viewingStudent?.id === studentId) {
      setViewingStudent(null);
    }

    fetch(`/api/students/${studentId}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Error deleting student:', err));
  };

  const updateStudentProfile = (studentId: string, updates: Partial<StudentProfile>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const updated = { ...s, ...updates };
          if (currentUser?.id === studentId) {
            setCurrentUser(updated);
          }
          if (viewingStudent?.id === studentId) {
            setViewingStudent(updated);
          }
          return updated;
        }
        return s;
      })
    );

    fetch(`/api/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((err) => console.error('Error updating student on server:', err));
  };

  // Admin Credentials State (customizable by user, persisted locally and on server)
  const [adminCredentials, setAdminCredentialsState] = useState<{ username: string; password: string }>(() => {
    try {
      const saved = localStorage.getItem('itadda_admin_credentials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.username && parsed?.password) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return { username: 'admin', password: 'admin' };
  });

  // Sync credentials from server on load
  useEffect(() => {
    fetch('/api/admin/credentials')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.credentials?.username) {
          setAdminCredentialsState((prev) => ({
            username: data.credentials.username || prev.username,
            password: prev.password,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const updateAdminCredentials = async (newUsername: string, newPassword: string) => {
    const cleanU = newUsername.trim();
    const cleanP = newPassword.trim();
    if (!cleanU || !cleanP) {
      return { success: false, message: 'Username and password cannot be empty.' };
    }
    const newCreds = { username: cleanU, password: cleanP };
    setAdminCredentialsState(newCreds);
    localStorage.setItem('itadda_admin_credentials', JSON.stringify(newCreds));

    try {
      await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCreds),
      });
    } catch (err) {
      console.error('Error saving admin credentials to server:', err);
    }

    soundEngine.playSuccess();
    return {
      success: true,
      message: `Admin credentials updated! Username: "${cleanU}". Please use your new password next time.`,
    };
  };

  // Admin Gate State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('nexusit_admin_unlocked') === 'true';
  });

  const unlockAdmin = (userId: string, accessCode: string) => {
    const cleanId = userId.trim();
    const cleanCode = accessCode.trim();

    // 1. Check custom credentials
    const matchesCustom =
      cleanId.toLowerCase() === adminCredentials.username.toLowerCase() &&
      cleanCode === adminCredentials.password;

    // 2. Safe default / fallback credentials
    const isUserValid =
      cleanId.toLowerCase() === 'priyanshu' ||
      cleanId.toLowerCase() === 'priyanshu gupta' ||
      cleanId.toLowerCase() === 'guptapriyanshu0101@gmail.com' ||
      cleanId.toLowerCase() === 'admin' ||
      cleanId.toLowerCase() === 'developer' ||
      cleanId === '24cs001' ||
      cleanId === '24cs024' ||
      cleanId === '24';

    const isCodeValid =
      cleanCode === 'admin' ||
      cleanCode === 'nexus2026' ||
      cleanCode === 'admin123' ||
      cleanCode === 'priyanshu#it' ||
      cleanCode === 'nexusit' ||
      cleanCode === 'itadda' ||
      cleanCode === 'itadda2026' ||
      cleanCode === 'itadda#2026' ||
      cleanCode === '24cs001' ||
      cleanCode === '24cs024';

    if (matchesCustom || (isUserValid && isCodeValid)) {
      setIsAdminUnlocked(true);
      sessionStorage.setItem('nexusit_admin_unlocked', 'true');

      // Ensure active student profile is linked to currentUser for admin self-management
      let targetProfile = students.find(
        (s) =>
          s.name.toLowerCase() === cleanId.toLowerCase() ||
          s.id === 'std_24' ||
          s.id === 'std_priyanshu' ||
          s.name.toLowerCase().includes('priyanshu') ||
          s.role === 'DEVELOPER_ADMIN' ||
          s.isAdmin === true
      );

      if (!targetProfile) {
        if (students.length > 0) {
          targetProfile = students[0];
        } else {
          targetProfile = {
            id: 'std_priyanshu_admin',
            name: cleanId.toLowerCase() === 'admin' ? 'Priyanshu Gupta' : cleanId,
            rollNumber: 24,
            division: 'Div A (IT-1)',
            branch: 'Information Technology',
            year: '1st Year (FE)',
            gender: 'Boys',
            phoneNumber: '09004565878',
            email: 'codingtech928@gmail.com',
            password: '1Q2W',
            profileTag: 'Lead Engineer & Admin',
            description: 'First Year Information Technology lead developer and administrator.',
            linkedinUrl: '',
            instagramHandle: '',
            techInterest: 'Full-Stack, React, Node.js, Python',
            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=95',
            role: 'DEVELOPER_ADMIN',
            batch: 'BATCH_2',
            status: 'APPROVED',
            likes: 24,
            dislikes: 0,
            likedBy: [],
            dislikedBy: [],
            createdAt: new Date().toISOString(),
            isAdmin: true,
            idCardTheme: 'spidey',
          };
          setStudents((prev) => [targetProfile!, ...prev]);
        }
      }

      if (targetProfile) {
        setCurrentUser(targetProfile);
        localStorage.setItem('nexusit_portal_user_id_live', targetProfile.id);
      }

      soundEngine.playSuccess();
      return { success: true, message: 'Admin verified successfully.' };
    }

    soundEngine.playDislike();
    return { success: false, message: 'Incorrect username or password.' };
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    sessionStorage.removeItem('nexusit_admin_unlocked');
  };

  const boostStudentLikes = (studentId: string, amount: number) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    const newLikes = Math.max(0, student.likes + amount);
    updateStudentProfile(studentId, { likes: newLikes });
  };

  const setStudentLikes = (studentId: string, likes: number) => {
    updateStudentProfile(studentId, { likes: Math.max(0, likes) });
  };

  const loginStudent = (identifier: string, password?: string) => {
    const cleanId = identifier.trim();
    const cleanPass = password ? password.trim() : '';

    if (!cleanId) {
      return { success: false, message: 'Please enter your registered Phone Number or Roll Number.' };
    }

    if (!cleanPass) {
      return { success: false, message: 'Password is required to log in.' };
    }

    const digitsOnly = cleanId.replace(/[^0-9]/g, '');

    const student = students.find((s) => {
      const sRollStr = String(s.rollNumber);
      const sRollPadded = sRollStr.padStart(3, '0');
      const isRollMatch =
        cleanId === sRollStr ||
        (digitsOnly === sRollStr && cleanId.length <= 4) ||
        cleanId.toLowerCase() === `24cs${sRollPadded}` ||
        cleanId.toLowerCase() === `24it${sRollPadded}` ||
        cleanId.toLowerCase() === `roll ${sRollStr}` ||
        cleanId.toLowerCase() === `roll ${sRollPadded}`;

      const sPhoneDigits = s.phoneNumber ? s.phoneNumber.replace(/[^0-9]/g, '') : '';
      const isPhoneMatch =
        digitsOnly.length >= 7 &&
        (sPhoneDigits === digitsOnly ||
          sPhoneDigits.endsWith(digitsOnly) ||
          (digitsOnly.length >= 10 && sPhoneDigits.includes(digitsOnly.slice(-10))));

      return isRollMatch || isPhoneMatch;
    });

    if (!student) {
      return {
        success: false,
        message: 'No registered student found with that Phone Number or Roll Number.',
      };
    }

    const isPasswordValid = student.password
      ? student.password === cleanPass
      : (cleanPass === '123456' || cleanPass === 'student123' || cleanPass === String(student.rollNumber) || cleanPass === 'admin');

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Incorrect password! Please enter the password you created during registration.',
      };
    }

    if (student.status === 'PENDING_APPROVAL') {
      return {
        success: false,
        message: 'Your profile is awaiting Admin approval before you can log in.',
      };
    }

    if (student.status === 'DISMISSED') {
      return {
        success: false,
        message: 'This student account has been dismissed by the department administrator.',
      };
    }

    setCurrentUser(student);
    localStorage.setItem('nexusit_portal_user_id_live', student.id);
    return { success: true, message: `Welcome back, ${student.name}!` };
  };

  const logoutStudent = () => {
    setCurrentUser(null);
    localStorage.setItem('nexusit_portal_user_id_live', 'GUEST');
  };

  const likeStudent = (studentId: string) => {
    if (!currentUser) {
      setIsRegisterModalOpen(true);
      return { success: false, message: 'Please register or sign in to endorse a batchmate!' };
    }

    if (currentUser.id === studentId) {
      return { success: false, message: 'You cannot like your own profile.' };
    }

    const target = students.find((s) => s.id === studentId);
    if (!target) return { success: false };

    const hasLiked = target.likedBy?.includes(currentUser.id);
    const hasDisliked = target.dislikedBy?.includes(currentUser.id);

    let updatedLikedBy = target.likedBy || [];
    let updatedDislikedBy = target.dislikedBy || [];
    let likesChange = 0;
    let dislikesChange = 0;

    if (hasLiked) {
      updatedLikedBy = updatedLikedBy.filter((id) => id !== currentUser.id);
      likesChange = -1;
    } else {
      updatedLikedBy = [...updatedLikedBy, currentUser.id];
      likesChange = 1;
      if (hasDisliked) {
        updatedDislikedBy = updatedDislikedBy.filter((id) => id !== currentUser.id);
        dislikesChange = -1;
      }
    }

    const updates = {
      likes: Math.max(0, target.likes + likesChange),
      dislikes: Math.max(0, target.dislikes + dislikesChange),
      likedBy: updatedLikedBy,
      dislikedBy: updatedDislikedBy,
    };

    updateStudentProfile(studentId, updates);
    return { success: true };
  };

  const dislikeStudent = (studentId: string) => {
    if (!currentUser) {
      setIsRegisterModalOpen(true);
      return { success: false, message: 'Please register or sign in to vote!' };
    }

    if (currentUser.id === studentId) {
      return { success: false, message: 'You cannot dislike your own profile.' };
    }

    const target = students.find((s) => s.id === studentId);
    if (!target) return { success: false };

    const hasLiked = target.likedBy?.includes(currentUser.id);
    const hasDisliked = target.dislikedBy?.includes(currentUser.id);

    let updatedLikedBy = target.likedBy || [];
    let updatedDislikedBy = target.dislikedBy || [];
    let likesChange = 0;
    let dislikesChange = 0;

    if (hasDisliked) {
      updatedDislikedBy = updatedDislikedBy.filter((id) => id !== currentUser.id);
      dislikesChange = -1;
    } else {
      updatedDislikedBy = [...updatedDislikedBy, currentUser.id];
      dislikesChange = 1;
      if (hasLiked) {
        updatedLikedBy = updatedLikedBy.filter((id) => id !== currentUser.id);
        likesChange = -1;
      }
    }

    const updates = {
      likes: Math.max(0, target.likes + likesChange),
      dislikes: Math.max(0, target.dislikes + dislikesChange),
      likedBy: updatedLikedBy,
      dislikedBy: updatedDislikedBy,
    };

    updateStudentProfile(studentId, updates);
    return { success: true };
  };

  // Notes
  const createNoteRequest = (
    title: string,
    subject: string,
    topic: string,
    urgency: 'Normal' | 'High' | 'Exam Tomorrow'
  ) => {
    if (!currentUser) {
      setIsRegisterModalOpen(true);
      return;
    }

    const newReq: NoteRequest = {
      id: `req_${Date.now()}`,
      title,
      subject,
      topic,
      urgency,
      requestedBy: {
        id: currentUser.id,
        name: currentUser.name,
        rollNumber: currentUser.rollNumber,
        photoUrl: currentUser.photoUrl,
      },
      requestedAt: new Date().toISOString(),
      fulfilled: false,
      fulfillments: [],
    };

    setNoteRequests((prev) => [newReq, ...prev]);

    fetch('/api/notes/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq),
    }).catch((err) => console.error('Error creating note request:', err));
  };

  const fulfillNoteRequest = (
    requestId: string,
    fulfillment: Omit<NoteFulfillment, 'id' | 'createdAt' | 'upvotes'>
  ) => {
    const fullFulfillment: NoteFulfillment = {
      ...fulfillment,
      id: `ful_${Date.now()}`,
      createdAt: new Date().toISOString(),
      upvotes: 0,
    };

    setNoteRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            fulfilled: true,
            fulfillments: [fullFulfillment, ...(req.fulfillments || [])],
          };
        }
        return req;
      })
    );

    fetch('/api/notes/fulfill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, fulfillment: fullFulfillment }),
    }).catch((err) => console.error('Error fulfilling note request:', err));
  };

  const deleteNoteRequest = (requestId: string) => {
    setNoteRequests((prev) => prev.filter((r) => r.id !== requestId));

    fetch(`/api/notes/requests/${requestId}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Error deleting note request:', err));
  };

  // Admin Direct Note Upload (Published immediately as fulfilled notes + resource library)
  const uploadAdminNote = (note: {
    title: string;
    subject: string;
    topic: string;
    urgency?: 'Normal' | 'High' | 'Exam Tomorrow';
    comment?: string;
    fileName?: string;
    fileSize?: string;
    fileType?: 'pdf' | 'image' | 'doc' | 'link';
    fileUrl?: string;
    alsoAddToResources?: boolean;
    resourceCategory?: ResourceItem['category'];
  }) => {
    const adminAuthor = currentUser || {
      id: 'admin_itadda',
      name: 'Department Admin (IT)',
      rollNumber: 1,
      role: 'DEVELOPER_ADMIN' as StudentRole,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    const fulfillment: NoteFulfillment = {
      id: `ful_${Date.now()}`,
      authorId: adminAuthor.id,
      authorName: adminAuthor.name,
      authorRoll: adminAuthor.rollNumber,
      authorPhoto: adminAuthor.photoUrl || '',
      comment: note.comment || 'Official department notes uploaded by Administrator.',
      fileName: note.fileName || `${note.topic.replace(/\s+/g, '_')}_Notes.pdf`,
      fileType: note.fileType || 'pdf',
      fileSize: note.fileSize || '2.8 MB',
      fileUrl: note.fileUrl || '#',
      createdAt: new Date().toISOString(),
      upvotes: 5,
    };

    const newReq: NoteRequest = {
      id: `req_${Date.now()}`,
      title: note.title || `Master Notes: ${note.topic}`,
      subject: note.subject,
      topic: note.topic,
      urgency: note.urgency || 'Normal',
      requestedBy: {
        id: adminAuthor.id,
        name: adminAuthor.name,
        rollNumber: adminAuthor.rollNumber,
        photoUrl: adminAuthor.photoUrl || '',
      },
      requestedAt: new Date().toISOString(),
      fulfilled: true,
      fulfillments: [fulfillment],
    };

    setNoteRequests((prev) => [newReq, ...prev]);

    fetch('/api/notes/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq),
    }).catch((err) => console.error('Error uploading admin note:', err));

    if (note.alsoAddToResources !== false) {
      uploadResource({
        title: note.title || `${note.subject} - ${note.topic}`,
        subject: note.subject,
        category: note.resourceCategory || 'Lecture Notes',
        description: note.comment || `Official lecture notes on ${note.topic} for First Year IT students.`,
        fileName: fulfillment.fileName || 'Notes.pdf',
        fileType: fulfillment.fileType === 'link' ? 'pdf' : (fulfillment.fileType as 'pdf' | 'doc' | 'image' | 'zip'),
        fileSize: fulfillment.fileSize || '2.8 MB',
        fileUrl: fulfillment.fileUrl || '#',
        uploadedBy: {
          id: adminAuthor.id,
          name: adminAuthor.name,
          rollNumber: adminAuthor.rollNumber,
          role: 'Admin / Faculty',
          photoUrl: adminAuthor.photoUrl,
        },
      });
    }
  };

  // Resources
  const uploadResource = (
    resource: Omit<ResourceItem, 'id' | 'uploadedAt' | 'downloads' | 'verified'>
  ) => {
    const newRes: ResourceItem = {
      ...resource,
      id: `res_${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      downloads: 0,
      verified: true,
    };

    setResources((prev) => [newRes, ...prev]);

    fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRes),
    }).catch((err) => console.error('Error uploading resource:', err));
  };

  const deleteResource = (resourceId: string) => {
    setResources((prev) => prev.filter((r) => r.id !== resourceId));

    fetch(`/api/resources/${resourceId}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Error deleting resource:', err));
  };

  // Notices
  const postNotice = (
    title: string,
    content: string,
    category: NoticeItem['category'],
    extra?: {
      attachmentUrl?: string;
      pinned?: boolean;
      authorName?: string;
      authorDesignation?: string;
    }
  ) => {
    const isDirectAdmin =
      isAdminUnlocked ||
      currentUser?.role === 'DEVELOPER_ADMIN' ||
      currentUser?.isAdmin ||
      currentUser?.role.startsWith('CR_');

    const newNotice: NoticeItem = {
      id: `not_${Date.now()}`,
      title,
      content,
      category,
      postedBy: {
        id: currentUser?.id || 'admin',
        name: extra?.authorName || currentUser?.name || 'Department Administrator',
        rollNumber: currentUser?.rollNumber || 0,
        role: currentUser?.role || 'DEVELOPER_ADMIN',
      },
      postedAt: new Date().toISOString(),
      status: isDirectAdmin ? 'APPROVED' : 'PENDING_APPROVAL',
      pinned: extra?.pinned !== undefined ? extra.pinned : isDirectAdmin,
      attachmentUrl: extra?.attachmentUrl,
      authorName: extra?.authorName,
      authorDesignation: extra?.authorDesignation,
    };

    setNotices((prev) => [newNotice, ...prev]);

    fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotice),
    }).catch((err) => console.error('Error posting notice:', err));
  };

  const approveNotice = (noticeId: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === noticeId ? { ...n, status: 'APPROVED' } : n))
    );

    fetch(`/api/notices/${noticeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED' }),
    }).catch((err) => console.error('Error approving notice:', err));
  };

  const dismissNotice = (noticeId: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === noticeId ? { ...n, status: 'DISMISSED' } : n))
    );

    fetch(`/api/notices/${noticeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DISMISSED' }),
    }).catch((err) => console.error('Error dismissing notice:', err));
  };

  const deleteNotice = (noticeId: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));

    fetch(`/api/notices/${noticeId}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Error deleting notice:', err));
  };

  // Chat
  const sendChatMessage = (
    content: string,
    replyTo?: { id: string; authorName: string; text: string }
  ) => {
    if (!currentUser) {
      setIsRegisterModalOpen(true);
      return;
    }

    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRoll: currentUser.rollNumber,
      authorPhoto: currentUser.photoUrl,
      authorRole: currentUser.role,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
      replyTo,
      reactions: {},
    };

    setChatMessages((prev) => [...prev, newMsg]);

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    }).catch((err) => console.error('Error sending chat message:', err));
  };

  const addChatReaction = (messageId: string, emoji: string) => {
    setChatMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const reactions = { ...(msg.reactions || {}) };
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...msg, reactions };
        }
        return msg;
      })
    );

    fetch('/api/chat/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, emoji }),
    }).catch((err) => console.error('Error sending chat reaction:', err));
  };

  const resetAllLikes = async () => {
    await resetData('likes');
  };

  const resetCampusVibePoll = async () => {
    await resetData('vibe');
  };

  const resetData = async (mode: 'default' | 'wipe' | 'likes' | 'vibe' = 'default') => {
    try {
      if (mode === 'likes') {
        const cleaned = (students || []).map((s) => ({
          ...s,
          likes: 0,
          dislikes: 0,
          likedBy: [],
          dislikedBy: [],
        }));
        setStudents(cleaned);
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            likes: 0,
            dislikes: 0,
            likedBy: [],
            dislikedBy: [],
          });
        }
        try {
          localStorage.setItem('nexusit_portal_students_live', JSON.stringify(cleaned));
          localStorage.removeItem('nexusit_students_permanent_backup');
        } catch {}

        try {
          const res = await fetch('/api/admin/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: 'likes' }),
          });
          const data = await res.json();
          if (data.database?.students) {
            setStudents(data.database.students);
          }
        } catch (err) {
          console.error('Error resetting likes:', err);
        }

        soundEngine.playSuccess();
        return { success: true, message: 'All student likes & votes reset to 0.' };
      }

      if (mode === 'vibe') {
        try {
          localStorage.removeItem('nexusit_today_vibe');
        } catch {}
        window.dispatchEvent(new CustomEvent('campus-vibe-reset'));
        setCampusVibeConfig((prev) => {
          const base = prev || DEFAULT_CAMPUS_VIBE;
          return {
            ...base,
            options: (base.options || []).map((opt) => ({ ...opt, count: 0 })),
          };
        });

        try {
          const res = await fetch('/api/admin/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: 'vibe' }),
          });
          const data = await res.json();
          if (data.vibeConfig) {
            setCampusVibeConfig(data.vibeConfig);
          }
        } catch (err) {
          console.error('Error resetting vibe poll:', err);
        }

        soundEngine.playSuccess();
        return { success: true, message: 'Campus vibe votes reset to 0.' };
      }

      // Complete reset: clear all local storage keys
      const ALL_KEYS = [
        'nexusit_portal_students_live',
        'nexusit_students_permanent_backup',
        'nexusit_students',
        'nexusit_portal_students',
        'nexusit_live_portal_students_v1',
        'nexusit_portal_user_id_live',
        'nexusit_portal_note_requests_live',
        'nexusit_portal_resources_live',
        'nexusit_portal_notices_live',
        'nexusit_portal_chat_live',
        'nexusit_unread_badges_live',
        'nexusit_today_vibe',
        'nexusit_campus_vibe_config',
        'nexusit_campus_streak',
      ];
      ALL_KEYS.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });

      if (mode === 'wipe' || mode === 'default') {
        localStorage.setItem('nexusit_db_wiped', 'true');
        setStudents([]);
        setCurrentUser(null);
        setNoteRequests([]);
        setResources([]);
        setNotices([]);
        setChatMessages([]);
        setCampusStreak(0);
        setCampusVibeConfig({
          ...DEFAULT_CAMPUS_VIBE,
          options: DEFAULT_CAMPUS_VIBE.options.map((o) => ({ ...o, count: 0 })),
        });
      }

      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();

      if (data.database) {
        setStudents(data.database.students || []);
        setNoteRequests(data.database.noteRequests || []);
        setResources(data.database.resources || []);
        setNotices(data.database.notices || []);
        setChatMessages(data.database.chatMessages || []);
        if (data.database.campusVibeConfig) {
          setCampusVibeConfig(data.database.campusVibeConfig);
        }
        setCampusStreak(data.database.campusStreak ?? 0);
      }

      soundEngine.playSuccess();
      return {
        success: true,
        message: 'All database records wiped clean.',
      };
    } catch (err) {
      console.error('Error during resetData:', err);
      return { success: false, message: 'Reset failed. Please check connection.' };
    }
  };

  const exportDatabaseBackup = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      students,
      noteRequests,
      resources,
      notices,
      chatMessages,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itadda_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppContext.Provider
      value={{
        students,
        currentUser,
        setCurrentUser,
        noteRequests,
        resources,
        notices,
        chatMessages,
        unreadBadges,
        clearTabBadge,
        registerStudent,
        approveStudent,
        dismissStudent,
        deleteStudent,
        updateStudentProfile,
        likeStudent,
        dislikeStudent,
        boostStudentLikes,
        setStudentLikes,
        loginStudent,
        logoutStudent,
        isAdminUnlocked,
        unlockAdmin,
        lockAdmin,
        adminCredentials,
        updateAdminCredentials,
        createNoteRequest,
        fulfillNoteRequest,
        deleteNoteRequest,
        uploadAdminNote,
        uploadResource,
        deleteResource,
        postNotice,
        approveNotice,
        dismissNotice,
        deleteNotice,
        sendChatMessage,
        addChatReaction,
        isRegisterModalOpen,
        setIsRegisterModalOpen,
        viewingStudent,
        setViewingStudent,
        isPersonalDetailsOpen,
        setIsPersonalDetailsOpen,
        resetData,
        resetAllLikes,
        resetCampusVibePoll,
        exportDatabaseBackup,
        isRealtimeConnected,
        theme,
        toggleTheme,
        isFireSoundActive,
        toggleFireSound,
        campusVibeConfig,
        updateCampusVibeConfig,
        voteCampusVibe,
        campusStreak,
        incrementCampusStreak,
        developerFooterConfig,
        updateDeveloperFooterConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
