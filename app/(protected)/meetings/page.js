"use client"
import React, { useEffect, useState } from 'react'
import MeetingCard from '../dashboard/meetingCard'
import Link from 'next/link';
import { useProject } from '@/app/context/ProjectContext';
import { deleteMeeting, fetchMeetingsProjectId } from '@/app/actions/useractions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const page = () => {
  const { currentProject, setCurrentProject } = useProject();
  const [meetingProjectId, setMeetingProjectId] = useState([])

  const getMeetings = async () => {
    if (!currentProject?.projectId) return;
    try {
      const meetings = await fetchMeetingsProjectId(currentProject?.projectId);
      setMeetingProjectId(meetings)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getMeetings();
    const interval = setInterval(() => {
      getMeetings();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentProject])

  const handleDelete = async (MeetingsId) => {
    await deleteMeeting(MeetingsId);
    await getMeetings();
  }
  return (
    <>
      <div className='w-3/4'>
        <MeetingCard />
      </div>
      <h1 className='my-3.5 font-medium text-xl'>Meetings</h1>
      {meetingProjectId.length === 0 && <div>No meetings to show</div>}
      <ul className="divide-y divide-gray-200">
        {meetingProjectId?.map(meeting => {

          return (<li key={meeting.MeetingsId} className='flex py-5 gap-x-6'>
            <div>
              <div className='min-w-0'>
                <div className='flex  gap-2'>
                  <div className='text-sm font-semibold line-clamp-1'>
                    {meeting.name}
                  </div>
                  {meeting.status === "Processing" && (
                    <Badge className='bg-yellow-500 text-white'>
                      Processing...
                    </Badge>
                  )}
                </div>
              </div>
              <div className='flex items-center text-xs text-gray-500 gap-x-2'>
                <p className='whitespace-nowrap'>
                  {new Date(meeting.createdAt).toLocaleString()}
                </p>
                <p className='truncate'>
                  {meeting.issues.length} issue
                </p>
              </div>
            </div>
            {!(meeting.status === 'Processing') &&
              <div className='flex items-center flex-none gap-x-4'>
                <Link href={`/meetings/${meeting.MeetingsId}`}>
                  <Button variant='outline' className='cursor-pointer'>
                    View Meeting
                  </Button>
                </Link>
                <Button variant='destructive' className="cursor-pointer" onClick={() => handleDelete(meeting.MeetingsId)}>
                  Delete
                </Button>
              </div>}
          </li>)
        })}
      </ul>
    </>
  )
}

export default page
