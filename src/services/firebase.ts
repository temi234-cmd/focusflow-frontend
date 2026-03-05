import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDLRQlAnFvthkODWnFS1X4odM3NtzQHd5o",
  authDomain: "focusflow-6938e.firebaseapp.com",
  projectId: "focusflow-6938e",
  storageBucket: "focusflow-6938e.firebasestorage.app",
  messagingSenderId: "1098154548812",
  appId: "1:1098154548812:web:4f4a96c3c2703a083b9ee9"
};
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()