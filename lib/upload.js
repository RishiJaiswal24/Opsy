import { storage } from "@/app/firebase";
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";

export function uploadFiles(file, setProgress) {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, file.name);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on("state_changed",
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                if (setProgress) setProgress(progress);
            },
            reject,
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
            }
        );
    });
}
