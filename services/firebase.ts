
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCa7TQ1fUnqlbQ0noZ3dEGgyqjFKFQSONk",
  authDomain: "ielts-marker-f24c0.firebaseapp.com",
  projectId: "ielts-marker-f24c0",
  storageBucket: "ielts-marker-f24c0.firebasestorage.app",
  messagingSenderId: "20112873720",
  appId: "1:20112873720:web:43ef96b945045a40b5c30d",
  measurementId: "G-YLFPM1Y1XF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
