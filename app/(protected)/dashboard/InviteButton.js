"use client"

import { useProject } from '@/app/context/ProjectContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react'

const InviteButton = () => {
    const { currentProject, setCurrentProject } = useProject();
    const [open, setOpen] = useState(false)
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Invite Team Member
                        </DialogTitle>
                    </DialogHeader>
                    <p className='text-sm text-gray-500'>Ask them to copy paste this link</p>
                    <Input
                        className='mt-4'
                        readOnly
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/join/${currentProject?.projectId}`)
                        }}
                        value={`${window.location.origin}/join/${currentProject?.projectId}`}
                    />
                </DialogContent>
            </Dialog>
            <Button onClick={()=>setOpen(true)} className="sm">Invite Members</Button>
        </>
    )
}

export default InviteButton
