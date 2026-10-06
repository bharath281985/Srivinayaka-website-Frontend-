import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBBugPPSSxbUZvjPTytrnZFAVDW2w_Um0Q",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vinayaka-collections.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vinayaka-collections",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vinayaka-collections.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "326006616137",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:326006616137:web:78871b49653d1e3d9a0f98",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-15L2HDYKLL"
};

let app = null;
let auth = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
}

export { app, auth };
export const isFirebaseConfigured = () => !!app;
