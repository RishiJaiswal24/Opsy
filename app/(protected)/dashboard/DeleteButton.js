"use client";

import { projectDelete } from '@/app/actions/useractions';
import { useProject } from '@/app/context/ProjectContext';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const DeleteButton = () => {
    const [deleting, setDeleting] = useState(false);
    const { currentProject, setCurrentProject } = useProject();
    const { user } = useUser();
    const router = useRouter();

    const handleDelete = async () => {
        try {
            setDeleting(true);

            await projectDelete(currentProject?.projectId);

            // 1️⃣ Clear React context
            setCurrentProject(null);

            // 2️⃣ Clear localStorage so deleted project doesn't load again
            if (user?.id) {
                localStorage.removeItem(`OpsyProject_${user.id}`);
            }

            // 3️⃣ Navigate away
            router.push("/dashboard");

            // 4️⃣ Optional small reload so sidebar updates
            setTimeout(() => window.location.reload(), 50);

        } catch (error) {
            console.error(error);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Button onClick={handleDelete} variant="destructive" disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
        </Button>
    );
};

export default DeleteButton;
