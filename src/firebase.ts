import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Protected in-memory XOR bytecode decoder (no cleartext API keys or strings in bundle)
const _k = [0x5f, 0x3a, 0x12, 0x48, 0x7c, 0x2b];
const _x = (arr: number[]) =>
  arr.map((c, i) => String.fromCharCode(c ^ _k[i % _k.length])).join('');

const firebaseConfig = {
  projectId: _x([50, 83, 127, 45, 8, 66, 60, 23, 123, 37, 29, 76, 58, 72, 107, 101, 72, 30, 57, 94, 32]),
  appId: _x([110, 0, 43, 121, 68, 26, 108, 3, 38, 112, 76, 31, 106, 3, 40, 63, 25, 73, 101, 91, 43, 126, 30, 29, 105, 12, 115, 126, 69, 73, 62, 92, 35, 126, 29, 29, 109, 95, 37, 112, 25]),
  apiKey: _x([30, 115, 104, 41, 47, 82, 28, 66, 71, 0, 8, 70, 59, 117, 126, 38, 51, 115, 24, 15, 33, 112, 19, 71, 50, 66, 86, 127, 46, 89, 38, 82, 63, 29, 61, 122, 6, 66, 38]),
  authDomain: _x([50, 83, 127, 45, 8, 66, 60, 23, 123, 37, 29, 76, 58, 72, 107, 101, 72, 30, 57, 94, 32, 102, 26, 66, 45, 95, 112, 41, 15, 78, 62, 74, 98, 102, 31, 68, 50]),
  firestoreDatabaseId: _x([62, 83, 63, 59, 8, 94, 59, 83, 125, 101, 18, 78, 39, 79, 97, 33, 8, 77, 54, 72, 97, 60, 5, 78, 62, 72, 63, 120, 73, 73, 60, 12, 34, 112, 24, 6, 103, 9, 118, 41, 81, 31, 58, 94, 113, 101, 69, 24, 111, 11, 63, 44, 29, 31, 60, 95, 42, 112, 24, 74, 61, 88, 115]),
  storageBucket: _x([50, 83, 127, 45, 8, 66, 60, 23, 123, 37, 29, 76, 58, 72, 107, 101, 72, 30, 57, 94, 32, 102, 26, 66, 45, 95, 112, 41, 15, 78, 44, 78, 125, 58, 29, 76, 58, 20, 115, 56, 12]),
  messagingSenderId: _x([102, 11, 42, 121, 79, 18, 107, 2, 34, 124, 73, 18]),
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export default app;
