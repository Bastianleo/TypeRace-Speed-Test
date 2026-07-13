import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAj6g2hLUxVu5RAeiE9uodPCnWumgeky28",
  authDomain: "typerace-82c75.firebaseapp.com",
  databaseURL: "https://typerace-82c75-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "typerace-82c75",
  storageBucket: "typerace-82c75.firebasestorage.app",
  messagingSenderId: "223611037309",
  appId: "1:223611037309:web:b37800b8556e8ddb177314",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const database = db;