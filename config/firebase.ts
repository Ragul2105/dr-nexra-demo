import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA8juAv6AqyoUE4iKpPYad086APZ6HiqX4",
  authDomain: "dr-website-c6487.firebaseapp.com",
  projectId: "dr-website-c6487",
  storageBucket: "dr-website-c6487.firebasestorage.app",
  messagingSenderId: "543278030430",
  appId: "1:543278030430:web:9d3e47a9633f7e301e1ecf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
