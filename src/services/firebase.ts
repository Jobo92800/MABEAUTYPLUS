import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB6AYTOIduPpwD689cENgg17EijJiPjvyY",
  authDomain: "mabeauty-plus-crm.firebaseapp.com",
  projectId: "mabeauty-plus-crm",
  storageBucket: "mabeauty-plus-crm.firebasestorage.app",
  messagingSenderId: "284040627618",
  appId: "1:284040627618:web:c629f3392fdd0899549efb",
  measurementId: "G-QK1X8BL81L"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence with custom settings and error handling
const initializeFirestore = async () => {
  try {
    await enableIndexedDbPersistence(db, {
      synchronizeTabs: true,
      forceOwnership: true
    });
    console.log('Offline persistence enabled');
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence enabled in first tab only');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser does not support offline persistence');
    } else {
      console.error('Error enabling offline persistence:', err);
    }
  }
};

// Initialize Firestore with offline persistence
initializeFirestore();

// Connect to emulators in development
if (import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('Connected to Firebase emulators');
  } catch (error) {
    console.warn('Failed to connect to Firebase emulators:', error);
  }
}