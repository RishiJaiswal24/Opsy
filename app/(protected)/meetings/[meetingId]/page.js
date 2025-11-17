"use client"
import { fetchIssues } from '@/app/actions/useractions';
import { AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { DialogDescription } from '@radix-ui/react-dialog';
import { VideoIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const MeetingsDetails = () => {
    const { meetingId } = useParams();
    const [meeting, setMeeting] = useState({})
    const [loading, setLoading] = useState(true)

    const getIssues = async (id) => {
        try {
            const data = await fetchIssues(id);
            setMeeting(data);
            console.log("Fetched issues:", data);
        } catch (error) {
            console.error("Error fetching issues:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const interval = setInterval(() => {
            getIssues(meetingId)
        }, 4000);
    }, [meetingId])

    if (loading) return (<div className='my-20 font-semibold text-xl text-center'>Loading...</div>)

    return (
        <>
            <div className='p-8'>
                <div className='mx-auto flex max-w-2xl items-center justify-between gap-x-8 border-b pb-8 lg:mx-0 lg:max-w-none'>
                    <div className='flex items-center gap-x-6'>
                        <div className='rounded-full border bg-white p-3'>
                            <VideoIcon className="h-6 w-6" />
                        </div>
                        <h1>
                            <div className='text-sm leading-6 text-gray-500'>
                                Meeting on {""}{new Date(meeting.createdAt).toLocaleString()}
                            </div>
                            <div className='mt-1 text-base font-semibold leading-6 text-gray-900'>
                                {meeting.name}
                            </div>
                        </h1>
                    </div>
                </div>
            </div>
            <div className="h-4"></div>
            <div className="p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {meeting?.issues?.map(issue => (
                        <IssueCard key={issue.start} issue={issue} />
                    ))}
                </div>
            </div>
        </>
    )
}
function IssueCard({ issue }) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <AlertDialogHeader>
                        <DialogTitle>{issue.gist}</DialogTitle>
                        <p className='text-gray-600'>
                            {issue.headline}
                        </p>
                        <blockquote className='mt-2 border-l-4 border-gray-300 bg-gray-50 p-4'>
                            <span className='text-sm text-gray-500'>
                                {issue.start} - {issue.end}
                            </span>
                            <p className='font-medium italic leading-relaxed text-gray-900'>
                                {issue.summary}
                            </p>
                        </blockquote>
                    </AlertDialogHeader>
                </DialogContent>
            </Dialog>
            <Card className="relative">
                <CardHeader>
                    <CardTitle className="text-xl">
                        {issue.gist}
                    </CardTitle>

                    <div className="border-b"></div>

                    <CardDescription>
                        {issue.headline}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setOpen(true)}>
                        Details
                    </Button>
                </CardContent>
            </Card>
        </>
    );
}


export default MeetingsDetails
