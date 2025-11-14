"use client"
import { Button } from '@/components/ui/button'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { Card } from '@/components/ui/card'
import { Presentation, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadFiles } from '@/lib/upload'
import { uploadToCloudinary } from '@/lib/uploadCloudinary'

const MeetingCard = () => {
    const [progress, setProgress] = useState(0)
    const [isUplaoding, setIsUplaoding] = useState(false)
    const [url, setUrl] = useState("")

    const { getRootProps, getInputProps } = useDropzone({
        accept: { "audio/*": [".mp3", ".wav", ".m4a"] },
        multiple: false,
        maxSize: 50_000_000,
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (!file) return;

            console.log("File:", file.name, file.size, file.type); 
            setIsUplaoding(true);
            setProgress(0);

            try {
                const uploadedURL = await uploadToCloudinary(file, setProgress);
                setUrl(uploadedURL);
                console.log("Uploaded file URL:", uploadedURL);
            } catch (err) {
                console.error(err);
            } finally {
                setIsUplaoding(false);
            }
        }
    });
    return (
        <Card className='col-span-2 flex flex-col justify-center !gap-0 items-center shadow-xl transition-transform duration-300 hover:scale-[1.03]' {...getRootProps()}>
            {!isUplaoding && (
                <>
                    <Presentation className='h-10 w-10 animate-bounce' />
                    <h3 className='mt-2 text-sm font-semibold text-gray-900'>
                        Create a new Meeting!
                    </h3>
                    <p className='mt-1 text-center text-sm text-gray-500'>
                        Analyse your meeting with Opsy
                        <br />
                        Powered by AI
                    </p>
                    <div className='mt-6'>
                        <Button disabled={isUplaoding}>
                            <Upload className='-ml-0.5 mr-1.5 h-5 w-5' aria-hidden="true" />
                            Upload meeting
                            <input className='hidden' {...getInputProps()} />
                        </Button>
                    </div>
                </>
            )}
            {isUplaoding && (
                <div className="flex flex-col items-center justify-center gap-2">
                    <CircularProgressbar
                        value={progress}
                        text={`${progress}%`}
                        className="size-20"
                        styles={buildStyles({
                            pathColor: "#2563eb",
                            textColor: "#2563eb",
                        })}
                    />
                    <p className="text-sm text-gray-500 text-center">Uploading your meeting...</p>
                </div>
            )}

        </Card>
    )
}

export default MeetingCard
