
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";




const firebaseConfig = {
  apiKey: "AIzaSyBb3eDNIHqveD0zCT51xKtzTrKElG-gxhQ",
  authDomain: "fir-c09cc.firebaseapp.com",
  projectId: "fir-c09cc",
  storageBucket: "fir-c09cc.firebasestorage.app",
  messagingSenderId: "807638259873",
  appId: "1:807638259873:web:5d2166a5c82649931638e0",
  measurementId: "G-YN2J8FJ30K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
