// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, uploadBytesResumable, getDownloadURL, ref } from "firebase/storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAni0Wygk8jccczyOWmtPYMEM-4u8i9pPo",
    authDomain: "opsy-36dee.firebaseapp.com",
    projectId: "opsy-36dee",
    storageBucket: "opsy-36dee.firebasestorage.app",
    messagingSenderId: "488153110793",
    appId: "1:488153110793:web:9530586e25dba305289bd8",
    measurementId: "G-G7ZE4D3BVS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export async function uploadFiles(file, setProgress) {
    return new Promise((resolve, reject) => {
        try {
            const storageRef = ref(storage, file.name);
            const uploadTask = uploadBytesResumable(storageRef, file)
            uploadTask.on('state_changed', snapshot => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                if (setProgress) setProgress(progress)
                switch (snapshot.state) {
                    case 'paused':
                        console.log('uplaod is paused');
                        break
                    case 'running':
                        console.log('is running');
                        break;
                }
            }, error => [
                reject(error)
            ], () => {
                getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl => {
                    resolve(downloadUrl)
                })
            })
        } catch {
            console.error(error)
            reject(error)
        }
    })
}