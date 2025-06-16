import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  setDoc,
  getDoc,
  serverTimestamp,
  doc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";

import { getStorage } from "firebase/storage";
import { MIN_VALUE_REG } from "recharts/types/util/ChartUtils";

const firebaseConfig = {
 

  //Api paid link

  apiKey: "AIzaSyCE4FHMyvKkLPTMxbNBGq-hDA4kgsOREZQ",
  authDomain: "rhino-review.firebaseapp.com",
  projectId: "rhino-review",
  storageBucket: "rhino-review.firebasestorage.app",
  messagingSenderId: "129605931582",
  appId: "1:129605931582:web:09b00f086664f02b70376f",
  measurementId: "G-X07GH0L017"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const q = query(collection(db, "users"), where("email", "==", user.email));
  const existingUsers = await getDocs(q);

  if (!existingUsers.empty && existingUsers.docs[0].id !== user.uid) {
    throw new Error("Email already exists. Please log in using email and password.");
  }
};

export { doc, getDoc, collection };
