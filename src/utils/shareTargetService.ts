/**
 * IT Adda - Web Share Target & Quick Material Share Service
 * Enables seamless OS-level sharing from WhatsApp, Telegram, Files, Drive, etc.,
 * directly into the IT Adda Resource Uploading interface.
 */

import { ResourceItem } from '../types';

export interface PendingSharedMaterial {
  id?: string;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  blob?: Blob | File;
  dataUrl?: string;
  title: string;
  subject: string;
  category: ResourceItem['category'];
  description: string;
  source: 'WEB_SHARE_TARGET_PWA' | 'SERVER_REDIRECT' | 'DRAG_AND_DROP' | 'SIMULATOR';
}

/**
 * Register the Service Worker to enable Web Share Target in Android/desktop OS Share Sheet
 */
export async function registerShareTargetServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    // Check for updates
    reg.update().catch(() => {});
  } catch (err) {
    console.debug('[PWA] Service Worker registration skipped or unavailable in sandbox:', err);
  }
}

/**
 * Retrieves any shared file stored by sw.js in IndexedDB
 */
export async function getSharedMaterialFromIndexedDB(): Promise<PendingSharedMaterial | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return null;

  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('ITAddaShareDB', 1);

      req.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('shared_materials')) {
          db.createObjectStore('shared_materials', { keyPath: 'id', autoIncrement: true });
        }
      };

      req.onsuccess = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('shared_materials')) {
          resolve(null);
          return;
        }

        const tx = db.transaction('shared_materials', 'readwrite');
        const store = tx.objectStore('shared_materials');
        const getAllReq = store.getAll();

        getAllReq.onsuccess = () => {
          const items = getAllReq.result;
          if (items && items.length > 0) {
            const latest = items[items.length - 1];
            // Clear items after reading
            store.clear();

            const meta = smartDeriveResourceMetadata(latest.name || 'Academic_Notes.pdf');
            const cleanTitle = cleanFileNameToTitle(latest.name || latest.title || 'Shared_Document.pdf');
            resolve({
              name: latest.name || 'Shared_Document.pdf',
              size: latest.size || 0,
              formattedSize: formatBytes(latest.size || 0),
              type: latest.type || 'application/pdf',
              blob: latest.blob,
              title: cleanTitle,
              subject: meta.subject,
              category: meta.category,
              description: latest.text || meta.description,
              source: 'WEB_SHARE_TARGET_PWA',
            });
          } else {
            resolve(null);
          }
        };

        getAllReq.onerror = () => resolve(null);
      };

      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Retrieves shared material from server temporary cache if passed via HTTP redirect
 */
export async function getSharedMaterialFromServer(shareId: string): Promise<PendingSharedMaterial | null> {
  try {
    const res = await fetch(`/api/share-target/${encodeURIComponent(shareId)}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.item) return null;

    const item = json.item;
    const meta = smartDeriveResourceMetadata(item.name || 'Academic_Material.pdf');
    const cleanTitle = cleanFileNameToTitle(item.name || item.title || 'Shared_Resource.pdf');

    return {
      id: item.id,
      name: item.name || 'Shared_Resource.pdf',
      size: item.size || 0,
      formattedSize: formatBytes(item.size || 0),
      type: item.type || 'application/pdf',
      dataUrl: item.dataUrl,
      title: cleanTitle,
      subject: meta.subject,
      category: meta.category,
      description: item.text || meta.description,
      source: 'SERVER_REDIRECT',
    };
  } catch (err) {
    console.warn('[ShareTarget] Error fetching shared file from server:', err);
    return null;
  }
}

/**
 * Intelligent file analysis to derive Clean Title, Category, and Subject automatically
 */
export function smartDeriveResourceMetadata(rawFileName: string): {
  title: string;
  category: ResourceItem['category'];
  subject: string;
  description: string;
} {
  const cleanTitle = cleanFileNameToTitle(rawFileName);
  const lower = rawFileName.toLowerCase();

  // Category Detection
  let category: ResourceItem['category'] = 'Lecture Notes';
  if (lower.includes('pyq') || lower.includes('question') || lower.includes('paper') || lower.includes('exam') || lower.includes('midsem') || lower.includes('endsem')) {
    category = 'Verified PYQ';
  } else if (lower.includes('lab') || lower.includes('manual') || lower.includes('practical') || lower.includes('experiment')) {
    category = 'Lab Manual';
  } else if (lower.includes('calculator') || lower.includes('formula') || lower.includes('formulae') || lower.includes('equations')) {
    category = 'Formula Sheet';
  } else if (lower.includes('cheat') || lower.includes('revision') || lower.includes('summary') || lower.includes('mindmap')) {
    category = 'Cheat Sheet';
  } else if (lower.includes('book') || lower.includes('author') || lower.includes('edition') || lower.includes('textbook')) {
    category = 'Reference Book';
  }

  // Subject Detection
  let subject = 'General Studies';
  if (lower.includes('math') || lower.includes('m1') || lower.includes('m2') || lower.includes('calculus') || lower.includes('algebra') || lower.includes('calculator')) {
    subject = 'Applied Mathematics';
  } else if (lower.includes('phys') || lower.includes('physics') || lower.includes('optics') || lower.includes('semiconductor')) {
    subject = 'Applied Physics';
  } else if (lower.includes('chem') || lower.includes('chemistry') || lower.includes('polymer')) {
    subject = 'Applied Chemistry';
  } else if (lower.includes('bee') || lower.includes('electrical') || lower.includes('circuit') || lower.includes('ac machine')) {
    subject = 'Basic Electrical Engg (BEE)';
  } else if (lower.includes('mech') || lower.includes('mechanics') || lower.includes('statics') || lower.includes('dynamics')) {
    subject = 'Engineering Mechanics';
  } else if (lower.includes('python') || lower.includes('pps') || lower.includes('coding') || lower.includes('programming') || lower.includes('c++') || lower.includes('dsa')) {
    subject = 'Programming & Problem Solving';
  } else if (lower.includes('graphic') || lower.includes('eg') || lower.includes('drawing') || lower.includes('cad')) {
    subject = 'Engineering Graphics';
  } else if (lower.includes('bxc') || lower.includes('electronics') || lower.includes('diode')) {
    subject = 'Basic Electronics';
  } else if (lower.includes('evs') || lower.includes('environment')) {
    subject = 'Environmental Studies';
  } else if (lower.includes('workshop') || lower.includes('seminar')) {
    subject = 'General Studies';
  }

  const description = `Shared directly to IT Adda for First Year IT batch (${category} · ${subject}).`;

  return {
    title: cleanTitle,
    category,
    subject,
    description,
  };
}

export function cleanFileNameToTitle(rawName: string): string {
  if (!rawName) return 'Academic Resource';

  // Strip extension (.pdf, .doc, .docx, .ppt, .pptx, .zip, etc.)
  let name = rawName.replace(/\.[a-zA-Z0-9]{1,6}$/i, '');
  // Replace underscores, dashes with single spaces
  name = name.replace(/[_\-]+/g, ' ');
  // Clean multiple spaces
  name = name.replace(/\s+/g, ' ').trim();

  // If the file is named "scientific calculator workshop" (or any specific name),
  // return the clean name directly so the resource title matches the PDF name exactly.
  return name || 'Academic Resource';
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '1.2 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}
