import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrVImqdVfBQmp51wt9QejZuNmMlPFsMIo",
  authDomain: "trabalho-1-49ebd.firebaseapp.com",
  projectId: "trabalho-1-49ebd",
  storageBucket: "trabalho-1-49ebd.firebasestorage.app",
  messagingSenderId: "1087262815168",
  appId: "1:1087262815168:web:03e2b12d7b6d8be1d24e25",
  measurementId: "G-VK8W5LPQQJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };