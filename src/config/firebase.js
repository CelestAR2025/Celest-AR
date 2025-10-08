// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyDgesVStEHu_73yuOTBvKqvK70IgQw6EJc",
  authDomain: "celest-ar.firebaseapp.com",
  projectId: "celest-ar",
  storageBucket: "celest-ar.firebasestorage.app",
  messagingSenderId: "713042520284",
  appId: "1:713042520284:web:a91e9ba95c72e55d0cec19",
  measurementId: "G-XTJBMQ7HS6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// For development - connect to emulators if running locally
if (location.hostname === 'localhost') {
  // Uncomment these lines if you want to use Firebase emulators for development
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;
