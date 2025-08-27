// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBssy2K7QwPowN71eWboNClbpeXfPL9qA0",
  authDomain: "deal-hunter-c87d8.firebaseapp.com",
  projectId: "deal-hunter-c87d8",
  storageBucket: "deal-hunter-c87d8.firebasestorage.app",
  messagingSenderId: "324074515870",
  appId: "1:324074515870:web:27782f70e40732f407ba8f",
  measurementId: "G-87H4LT8WML"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);