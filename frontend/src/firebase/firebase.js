import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDZgXOBo5a99fogmjxXMOEAwbzcu-gWxRQ",
  authDomain: "luck-isru-tea.firebaseapp.com",
  projectId: "luck-isru-tea",
  storageBucket: "luck-isru-tea.firebasestorage.app",
  messagingSenderId: "449786834165",
  appId: "1:449786834165:web:09c047d1dcbbe7cd24a9bc",
  measurementId: "G-F4J7XGBB3G",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const facebookProvider = new FacebookAuthProvider();