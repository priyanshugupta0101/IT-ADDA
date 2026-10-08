import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  StudentProfile,
  NoteRequest,
  ResourceItem,
  NoticeItem,
  ChatMessage,
  CampusVibeConfig,
} from '../types';

export const DEFAULT_CAMPUS_VIBE: CampusVibeConfig = {
  title: "Today's Campus Vibe",
  subtitle: "Tap what describes your study mood today",
  options: [
    { id: 'grind', label: 'Midsem / Exam Grind', icon: '📚', count: 0 },
    { id: 'hack', label: 'Coding & Projects', icon: '💻', count: 0 },
    { id: 'canteen', label: 'Canteen & Chill', icon: '☕', count: 0 },
    { id: 'lab', label: 'Lab Submissions', icon: '⚡', count: 0 },
  ],
};

// Validate connection to Firestore
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, retrying...');
    }
  }
}

// -----------------------------------------------------------------------------
// Real-time Listeners (Active across all connected devices worldwide)
// -----------------------------------------------------------------------------

export function subscribeToStudents(callback: (students: StudentProfile[]) => void) {
  const colRef = collection(db, 'students');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: StudentProfile[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as StudentProfile);
      });
      // Sort: Approved first, then by rollNumber
      list.sort((a, b) => (a.rollNumber || 0) - (b.rollNumber || 0));
      callback(list);
    },
    (error) => {
      console.error('Firestore students subscription error:', error);
    }
  );
}

export function subscribeToNoteRequests(callback: (requests: NoteRequest[]) => void) {
  const colRef = collection(db, 'noteRequests');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: NoteRequest[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as NoteRequest);
      });
      // Newest first
      list.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
      callback(list);
    },
    (error) => {
      console.error('Firestore noteRequests subscription error:', error);
    }
  );
}

export function subscribeToResources(callback: (resources: ResourceItem[]) => void) {
  const colRef = collection(db, 'resources');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: ResourceItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as ResourceItem);
      });
      list.sort((a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime());
      callback(list);
    },
    (error) => {
      console.error('Firestore resources subscription error:', error);
    }
  );
}

export function subscribeToNotices(callback: (notices: NoticeItem[]) => void) {
  const colRef = collection(db, 'notices');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: NoticeItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as NoticeItem);
      });
      // Pinned notices first, then newest
      list.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime();
      });
      callback(list);
    },
    (error) => {
      console.error('Firestore notices subscription error:', error);
    }
  );
}

export function subscribeToChatMessages(callback: (messages: ChatMessage[]) => void) {
  const colRef = collection(db, 'chatMessages');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as ChatMessage);
      });
      list.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
      callback(list);
    },
    (error) => {
      console.error('Firestore chatMessages subscription error:', error);
    }
  );
}

export function subscribeToCampusVibe(callback: (config: CampusVibeConfig) => void) {
  const docRef = doc(db, 'config', 'campusVibe');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as CampusVibeConfig);
      } else {
        // Initialize with 0 counts if not found
        setDoc(docRef, DEFAULT_CAMPUS_VIBE).catch(() => {});
        callback(DEFAULT_CAMPUS_VIBE);
      }
    },
    (error) => {
      console.error('Firestore campusVibe subscription error:', error);
    }
  );
}

// -----------------------------------------------------------------------------
// Real-time Database Operations (Syncs to all devices instantly)
// -----------------------------------------------------------------------------

export async function saveStudentDoc(student: StudentProfile): Promise<void> {
  const docRef = doc(db, 'students', student.id);
  await setDoc(docRef, student, { merge: true });
}

export async function updateStudentDoc(id: string, updates: Partial<StudentProfile>): Promise<void> {
  const docRef = doc(db, 'students', id);
  await updateDoc(docRef, updates);
}

export async function deleteStudentDoc(id: string): Promise<void> {
  const docRef = doc(db, 'students', id);
  await deleteDoc(docRef);
}

export async function saveNoteRequestDoc(request: NoteRequest): Promise<void> {
  const docRef = doc(db, 'noteRequests', request.id);
  await setDoc(docRef, request, { merge: true });
}

export async function updateNoteRequestDoc(id: string, updates: Partial<NoteRequest>): Promise<void> {
  const docRef = doc(db, 'noteRequests', id);
  await updateDoc(docRef, updates);
}

export async function deleteNoteRequestDoc(id: string): Promise<void> {
  const docRef = doc(db, 'noteRequests', id);
  await deleteDoc(docRef);
}

export async function saveResourceDoc(resource: ResourceItem): Promise<void> {
  const docRef = doc(db, 'resources', resource.id);
  await setDoc(docRef, resource, { merge: true });
}

export async function deleteResourceDoc(id: string): Promise<void> {
  const docRef = doc(db, 'resources', id);
  await deleteDoc(docRef);
}

export async function saveNoticeDoc(notice: NoticeItem): Promise<void> {
  const docRef = doc(db, 'notices', notice.id);
  await setDoc(docRef, notice, { merge: true });
}

export async function updateNoticeDoc(id: string, updates: Partial<NoticeItem>): Promise<void> {
  const docRef = doc(db, 'notices', id);
  await updateDoc(docRef, updates);
}

export async function deleteNoticeDoc(id: string): Promise<void> {
  const docRef = doc(db, 'notices', id);
  await deleteDoc(docRef);
}

export async function saveChatMessageDoc(message: ChatMessage): Promise<void> {
  const docRef = doc(db, 'chatMessages', message.id);
  await setDoc(docRef, message);
}

export async function updateChatMessageDoc(id: string, updates: Partial<ChatMessage>): Promise<void> {
  const docRef = doc(db, 'chatMessages', id);
  await updateDoc(docRef, updates);
}

export async function saveCampusVibeConfig(config: CampusVibeConfig): Promise<void> {
  const docRef = doc(db, 'config', 'campusVibe');
  await setDoc(docRef, config);
}

export function subscribeToDeveloperFooter(callback: (config: any) => void) {
  const docRef = doc(db, 'config', 'developerFooter');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    },
    (error) => {
      console.error('Firestore developerFooter subscription error:', error);
    }
  );
}

export async function saveDeveloperFooterDoc(config: any): Promise<void> {
  const docRef = doc(db, 'config', 'developerFooter');
  await setDoc(docRef, config, { merge: true });
}

export function subscribeToAdminCredentials(callback: (creds: { username: string; password: string }) => void) {
  const docRef = doc(db, 'config', 'adminCredentials');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as { username: string; password: string });
      }
    },
    (error) => {
      console.error('Firestore adminCredentials subscription error:', error);
    }
  );
}

export async function saveAdminCredentialsDoc(creds: { username: string; password: string }): Promise<void> {
  const docRef = doc(db, 'config', 'adminCredentials');
  await setDoc(docRef, creds, { merge: true });
}

// Reset operations that broadcast to all devices instantly
export async function resetAllStudentLikesInFirestore(): Promise<void> {
  const colRef = collection(db, 'students');
  const snap = await getDocs(colRef);
  const batch = writeBatch(db);
  snap.forEach((d) => {
    batch.update(d.ref, { likes: 0, dislikes: 0, likedBy: [], dislikedBy: [] });
  });
  await batch.commit();
}

export async function resetCampusVibeVotesInFirestore(): Promise<void> {
  const docRef = doc(db, 'config', 'campusVibe');
  const snap = await getDocs(collection(db, 'config'));
  const cfg = snap.docs.find((d) => d.id === 'campusVibe')?.data() as CampusVibeConfig | undefined;
  const base = cfg || DEFAULT_CAMPUS_VIBE;
  const resetOptions = (base.options || DEFAULT_CAMPUS_VIBE.options).map((opt) => ({
    ...opt,
    count: 0,
  }));
  await setDoc(docRef, { ...base, options: resetOptions });
}

export async function wipeAllDataInFirestore(): Promise<void> {
  const collections = ['students', 'noteRequests', 'resources', 'notices', 'chatMessages'];
  for (const cName of collections) {
    const snap = await getDocs(collection(db, cName));
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  // Reset vibe poll votes to 0
  const docRef = doc(db, 'config', 'campusVibe');
  await setDoc(docRef, DEFAULT_CAMPUS_VIBE);
}
