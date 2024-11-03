// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 





const firebaseConfig = {
  apiKey: "AIzaSyDAYORtT_yPLCmeN38hLh7ZhjOjc3N23yU",
  authDomain: "citizen-report-app-45f6c.firebaseapp.com",
  projectId: "citizen-report-app-45f6c",
  storageBucket: "citizen-report-app-45f6c.appspot.com",
  messagingSenderId: "382465207068",
  appId: "1:382465207068:web:2b647e65ba8807858c68d9",
  measurementId: "G-9JFKSH4G0L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
export const storage = getStorage(app);

export { auth, db };