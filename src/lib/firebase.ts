// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDfmhWSjALI7hOsTV-P989QVr4OYiQjsg",
  authDomain: "iedc-mbcet.firebaseapp.com",
  databaseURL: "https://iedc-mbcet-default-rtdb.firebaseio.com",
  projectId: "iedc-mbcet",
  storageBucket: "iedc-mbcet.appspot.com",
  messagingSenderId: "342641780087",
  appId: "1:342641780087:web:fc7f15b05c903c24776d72",
  measurementId: "G-1T18WXM7JB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app)
export default app
