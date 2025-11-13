import { initializeApp } from "firebase/app";
import { getStorage,ref,uploadBytesResumable,getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAni0Wygk8jccczyOWmtPYMEM-4u8i9pPo",
  authDomain: "opsy-36dee.firebaseapp.com",
  projectId: "opsy-36dee",
  storageBucket: "opsy-36dee.appspot.com", 
  messagingSenderId: "488153110793",
  appId: "1:488153110793:web:9530586e25dba305289bd8",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
