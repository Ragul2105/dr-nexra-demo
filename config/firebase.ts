import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// commented out by ragul for testing purposes - using a different Firebase project with limited access to prevent unauthorized usage of the original project's resources. The original config is retained here for reference and can be re-enabled when needed.
// const firebaseConfig = {
//   apiKey: "AIzaSyA8juAv6AqyoUE4iKpPYad086APZ6HiqX4",
//   authDomain: "dr-website-c6487.firebaseapp.com",
//   projectId: "dr-website-c6487",
//   storageBucket: "dr-website-c6487.firebasestorage.app",
//   messagingSenderId: "543278030430",
//   appId: "1:543278030430:web:9d3e47a9633f7e301e1ecf"
// };


// Temporary Firebase config for testing purposes - limited access to prevent unauthorized usage of the original project's resources. The original config is retained above for reference and can be re-enabled when needed.
const firebaseConfig = {
  apiKey: "AIzaSyCBfGM7_txKQa7XCM5VwATDh4UcqzfHAoE",
  authDomain: "dr-testing-new.firebaseapp.com",
  projectId: "dr-testing-new",
  storageBucket: "dr-testing-new.firebasestorage.app",
  messagingSenderId: "546852793335",
  appId: "1:546852793335:web:e058a05bf455b5c26ddcf2"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
