"use client";

import { useState } from "react";
import { uploadToCloudinary } from "@/lib/uploadCloudinary";

export default function AudioUploader() {
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const uploadedURL = await uploadToCloudinary(file, setProgress);
    setUrl(uploadedURL);
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleUpload} />
      <p>Progress: {progress}%</p>
        <div>{url}</div>
      {url && (
        <audio controls src={url} />
      )}
    </div>
  );
}
