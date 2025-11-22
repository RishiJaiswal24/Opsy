import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React, { Suspense } from 'react'
import { UserButton } from '@clerk/nextjs'
import { AppSidebar } from './app-sidebar'

const Layout = ({ children }) => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className='w-full m-2'>
                {/* navbar */}
                <div className='flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4'>

                    {/* HAMBURGER BUTTON FOR MOBILE */}
                    <div className="block md:hidden">
                        <SidebarTrigger />
                    </div>

                    <div className="ml-auto"></div>

                    <Suspense fallback={<div className="w-8 h-8" />}>
                        <UserButton />
                    </Suspense>
                </div>
                <div className="h-4"></div>
                {/* dynamic value */}
                <div className='border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-5rem)] p-4'>
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}

export default Layout