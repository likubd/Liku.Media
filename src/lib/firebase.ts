import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACGz2kpLyHigS6OBEMTvzLwDwRsM8J_74",
  authDomain: "likumediabd.firebaseapp.com",
  projectId: "likumediabd",
  storageBucket: "likumediabd.firebasestorage.app",
  messagingSenderId: "458228528679",
  appId: "1:458228528679:web:e7afd86e7d2ad01c0b4002",
  measurementId: "G-72ZM67NCXE"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Services with SSR Safety
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, analytics };
