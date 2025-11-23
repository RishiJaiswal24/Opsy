"use client"
import { useUser } from '@clerk/nextjs'
import React, { useState, useEffect } from 'react'
import { useProject } from '@/app/context/ProjectContext'
import { ExternalLink, Github, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { fetchCommitLog } from '@/app/actions/useractions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import MDEditor from '@uiw/react-md-editor'
import FileRefrenced from './fileRefrenced'
import AskQuestion from './askQuestion'
import MeetingCard from './meetingCard'
import DeleteButton from './DeleteButton'
// import { indexGithubRepo } from '@/app/api/github-loadier/route'

const Dashboard = () => {
  const { user } = useUser()
  const { currentProject, setCurrentProject } = useProject();

  //used for polling commits onto the dashboard 
  const [commits, setCommits] = useState([])
  const [pollLoading, setPollLoading] = useState(false)


  useEffect(() => {
    if (!currentProject?.projectId) return;
    setPollLoading(true);
    setCommits([])
    const syncCommit = async () => {
      try {
        await fetch("/api/pollcommit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: currentProject?.projectId }),
        })
        const data = await fetchCommitLog(currentProject?.projectId);
        setCommits(data);
      } catch (err) {
        console.error("error syncing commits")
      }
      finally {
        setPollLoading(false)
      }
    }
    syncCommit();
  }, [currentProject?.projectId])


  if (!currentProject?.projectId) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-gray-500'>Please select a project</p>
      </div>
    )
  }
  return (
    <div className='h-full'>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Github */}
        <div className="w-fit rounded-md bg-primary px-4 py-3 flex">
          <Github className="size-5 text-white" />
          <div className="ml-2">
            <p className="flex gap-2 text-sm font-medium text-white">
              This project is linked to{' '}
              <Link
                href={currentProject?.projectUrl ?? ""}
                className="flex hover:underline"
                target="_blank"
              >
                <span className="hidden lg:block">
                  {currentProject?.projectUrl}
                </span>
                <ExternalLink className="ml-1 size-5" />
              </Link>
            </p>
          </div>
        </div>

        {/* Spacer NOT needed */}
        {currentProject?.projectId && <DeleteButton />}
      </div>

      {/* ask question and meeting card formating  */}
      <div className="mt-4">
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-5'>
          <AskQuestion />
          <MeetingCard />
        </div>
      </div>
      <div className="mt-8"></div>

      <div className=''>

        {pollLoading ? (<>
          <div className='font-semibold min-h-full flex items-center justify-center'>
            Loading...
          </div>
        </>) : (<>
          <ul className='space-y-4'>
            {commits.map((commit, index) => {
              return (<li key={index} className='flex gap-4 relative transition-transform duration-300 hover:scale-[1.02]'>
                <>
                  <img src={commit.commitAuthorAvatar} alt="commmit_avatar" className='relative flex-none size-8 mt-4 rounded-full bg-gray-50' />
                  <div className='flex-auto roundedmd bg-white p-3 ring-1 ring-inset ring-gray-200'>
                    <div className=' justify-between gap-x-4'>


                      <Link target='_blank' href={`${currentProject?.projectUrl}/commits/${commit.commitHash}`} className=' py-0.5 text-sm leading-5 text-gray-500'>
                        <span className='font-medium text-gray-900'>{commit.commitAuthorName}</span>
                        {' '}
                        <span className='inline-flex items-center'>
                          commited
                          <ExternalLink className='ml-1 size-4' />
                        </span>

                      </Link>

                      <div className='font-semibold'>{commit.commitMessage}</div>
                      <div className='mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500'>
                        {commit.summary}
                      </div>
                    </div>
                  </div>
                </>
              </li>)
            }
            )}
          </ul>
        </>)}
      </div>



    </div>

  )
}

export default Dashboard
