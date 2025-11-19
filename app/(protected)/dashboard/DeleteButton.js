import { projectDelete } from '@/app/actions/useractions';
import { useProject } from '@/app/context/ProjectContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DeleteButton = () => {
    const [deleting, setDeleting] = useState(false);
    const { currentProject, setCurrentProject } = useProject();
    const router = useRouter();

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await projectDelete(currentProject?.projectId);

            setCurrentProject(null);

            router.refresh(); 
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
            window.location.reload()
        }
    };

    return (
        <Button onClick={handleDelete} variant="destructive" disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
        </Button>
    );
};

export default DeleteButton;
