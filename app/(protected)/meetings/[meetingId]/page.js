"use client"
import { useParams } from 'next/navigation';
import React from 'react'

const MeetingsDetails = () => {
    const { meetingId } = useParams();
    return (
        <>
            <div>
             Meetings: {meetingId}
            </div>
        </>
    )
}

export default MeetingsDetails
