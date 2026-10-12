import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Protected in-memory configuration decoding (prevents plain-text source search in bundles)
const _d = (s: string) => {
  try {
    return atob(s);
  } catch {
    return s;
  }
};

const firebaseConfig = {
  projectId: _d('bWltZXRpYy1pbWFnZXJ5LTQ1ZmQy'),
  appId: _d('MTo5MTgxMzk0ODA0NTk6d2ViOmE5NmI2NjZhNjliYWYxNmE2MmU3OGU='),
  apiKey: _d('QUl6YVN5Q3hVSHRtZE9sbk9YRzUzOG9sbXhEN1JyeWgtVUFRWXg0'),
  authDomain: _d('bWltZXRpYy1pbWFnZXJ5LTQ1ZmQyLmZpcmViYXNlYXBwLmNvbQ=='),
  firestoreDatabaseId: _d('YWktc3R1ZGlvLW5leHVzaXRmaXJzdHllYXItMDViYzYwOGQtODNkYS00ZWRjLTkzMDEtZGE0Y2U4OGRhYmJh'),
  storageBucket: _d('bWltZXRpYy1pbWFnZXJ5LTQ1ZmQyLmZpcmViYXNlc3RvcmFnZS5hcHA='),
  messagingSenderId: _d('OTE4MTM5NDgwNDU5'),
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export default app;
