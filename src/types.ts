export type StudentRole =
  | 'DEVELOPER_ADMIN'
  | 'STUDENT'
  | 'CR_BOYS'
  | 'CR_GIRLS'
  | 'BR1_BOYS'
  | 'BR1_GIRLS'
  | 'BR2_BOYS'
  | 'BR2_GIRLS'
  | 'BR3_BOYS'
  | 'BR3_GIRLS';

export type StudentStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'DISMISSED';

export type BatchType = 'BATCH_1' | 'BATCH_2' | 'BATCH_3';

export type GenderType = 'Boys' | 'Girls';

export type IdCardTheme = 'spidey' | 'iron-man' | 'barbie' | 'hacker' | 'batman' | 'cyberpunk' | 'fire-pixel';

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: number;
  division: string;
  branch: string;
  year: string;
  gender: GenderType;
  phoneNumber: string; // Private personal detail
  email: string;
  profileTag: string;
  description: string;
  linkedinUrl: string;
  instagramHandle: string;
  techInterest: string;
  photoUrl: string;
  role: StudentRole;
  batch: BatchType;
  status: StudentStatus;
  likes: number;
  dislikes: number;
  likedBy: string[]; // IDs of students who liked
  dislikedBy: string[]; // IDs of students who disliked
  createdAt: string;
  isAdmin?: boolean;
  isDeveloper?: boolean;
  idCardTheme?: IdCardTheme;
  password?: string;
  streak?: number; // Consecutive active daily study streak
  lastActiveDate?: string; // YYYY-MM-DD last active check-in date
  longestStreak?: number; // Personal best peak streak record
}

export interface NoteFulfillment {
  id: string;
  authorId: string;
  authorName: string;
  authorRoll: number;
  authorPhoto: string;
  comment: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'pdf' | 'image' | 'doc' | 'link';
  fileSize?: string;
  createdAt: string;
  upvotes: number;
}

export interface NoteRequest {
  id: string;
  title: string;
  subject: string;
  topic: string;
  urgency: 'Normal' | 'High' | 'Exam Tomorrow';
  requestedBy: {
    id: string;
    name: string;
    rollNumber: number;
    photoUrl: string;
  };
  requestedAt: string;
  fulfilled: boolean;
  fulfillments: NoteFulfillment[];
}

export interface ResourceItem {
  id: string;
  title: string;
  subject: string;
  category: 'Verified PYQ' | 'Lab Manual' | 'Lecture Notes' | 'Formula Sheet' | 'Reference Book' | 'Cheat Sheet';
  description: string;
  uploadedBy: {
    id: string;
    name: string;
    rollNumber: number;
    role?: string;
    photoUrl?: string;
  };
  uploadedAt: string;
  fileUrl: string;
  fileName: string;
  fileType: 'pdf' | 'doc' | 'image' | 'zip';
  fileSize: string;
  downloads: number;
  verified: boolean;
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  category: 'Exam Schedule' | 'Lab Submission' | 'College Event' | 'CR Announcement' | 'Academic' | 'Urgent';
  postedBy: {
    id: string;
    name: string;
    rollNumber: number;
    role?: string;
  };
  postedAt: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'DISMISSED';
  attachmentUrl?: string;
  pinned?: boolean;
  authorName?: string;
  authorDesignation?: string;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorRoll: number;
  authorPhoto: string;
  authorRole: StudentRole;
  content: string;
  timestamp: string;
  createdAt?: string;
  replyTo?: {
    id: string;
    authorName: string;
    text: string;
  };
  reactions?: Record<string, number>;
}

export interface CampusVibeOption {
  id: string;
  label: string;
  icon: string;
  count: number;
}

export interface CampusVibeConfig {
  title: string;
  subtitle: string;
  options: CampusVibeOption[];
}
