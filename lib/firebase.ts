import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB_woxkoI1jC2EnombBVbBdXvUWv62vXm8",
  authDomain: "kurdname-7ba60.firebaseapp.com",
  databaseURL: "https://kurdname-7ba60-default-rtdb.firebaseio.com",
  projectId: "kurdname-7ba60",
  storageBucket: "kurdname-7ba60.firebasestorage.app",
  messagingSenderId: "412204222619",
  appId: "1:412204222619:web:aaded8dd733c85646f1e3e",
  measurementId: "G-L7B9WQZEZX",
};

const app = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

export const database = getDatabase(app);