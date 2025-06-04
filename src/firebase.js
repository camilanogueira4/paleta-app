// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7OPuSayH1AF2lbARec_Ua65Q4nCtptCY",
  authDomain: "paletaapp.firebaseapp.com",
  projectId: "paletaapp",
  storageBucket: "paletaapp.firebasestorage.app",
  messagingSenderId: "61279400103",
  appId: "1:61279400103:web:70de10534445fa0b232b82"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
