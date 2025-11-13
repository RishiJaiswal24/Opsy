'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const SyncUserPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const syncUser = async () => {
            try {
                const res = await fetch('/api/sync-user'); // call your GET route
                const data = await res.json();
                if (data.success) {
                    router.replace('/');
                } else {
                    console.error('Sync failed');
                }
            } catch (err) {
                console.error('Error syncing user:', err);
            } finally {
                setLoading(false);
            }
        };

        syncUser();
    }, [router]);

    return (
        <>
            <div className='w-full min-h-screen justify-center items-center'>
                {loading ? <div>Wait a moment...</div> : <div>Something went wrong</div>}
            </div>
        </>
    );
};

export default SyncUserPage;
