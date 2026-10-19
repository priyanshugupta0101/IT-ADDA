// IT Adda - Service Worker & Web Share Target Handler
const CACHE_NAME = 'itadda-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Helper: Save shared file to IndexedDB for client retrieval
function saveSharedFileToIndexedDB(data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ITAddaShareDB', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('shared_materials')) {
        db.createObjectStore('shared_materials', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction('shared_materials', 'readwrite');
      const store = tx.objectStore('shared_materials');
      store.add(data);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

// Handle Web Share Target POST requests from the OS Share Sheet
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const files = formData.getAll('resourceFiles');
          const file = files[0] || formData.get('file');
          const title = formData.get('title') || '';
          const text = formData.get('text') || '';
          const sharedUrl = formData.get('url') || '';

          if (file) {
            await saveSharedFileToIndexedDB({
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
              blob: file,
              title: typeof title === 'string' ? title : '',
              text: typeof text === 'string' ? text : '',
              url: typeof sharedUrl === 'string' ? sharedUrl : '',
              timestamp: Date.now(),
            });
          }

          // Return 303 See Other redirect to the app's resource uploading view
          return Response.redirect('/?share_target=true&tab=resources&t=' + Date.now(), 303);
        } catch (err) {
          console.error('[IT Adda SW] Error handling share_target:', err);
          return Response.redirect('/?share_target=fallback&tab=resources', 303);
        }
      })()
    );
    return;
  }
});
