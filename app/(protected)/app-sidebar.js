"use client"

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useProject } from "../context/ProjectContext"

const items = [
    {
        title: "Dashboard",
        url: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: "Meetings",
        url: '/meetings',
        icon: Presentation
    },
    {
        title: "Billings",
        url: '/billings',
        icon: CreditCard
    },
    {
        title: "Q&A",
        url: '/qa',
        icon: Bot
    },
]

export function AppSidebar() {
    const pathname = usePathname();
    const { open } = useSidebar();
    const { user } = useUser();
    
    const [projects, setProjects] = useState([]);
    const { currentProject, setCurrentProject } = useProject();

    
    useEffect(() => {
        console.log(projects);
    }, [projects])
    
    // useEffect(() => {
    //     console.log(currentProject);
    // }, [currentProject])
    
    // useEffect(() => {
    //     if(!user) return;
    //     const saveLoc=`OpsyProject_${user.id}`
    //     const saved = localStorage.getItem(saveLoc)
    //     if (saved) {
    //         setCurrentProject(JSON.parse(saved));
    //     }
    // }, [user])
    
    // useEffect(() => {
    //     if(!user || !currentProject?.projectId) return;
    //     const saveLoc=`OpsyProject_${user.id}`
    //     if (currentProject) {
    //         localStorage.setItem(saveLoc, JSON.stringify(currentProject));
    //     }
    // }, [currentProject,user])

    const handleProjectSelect = (project) => {
        setCurrentProject(project);
    }

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const res = await fetch("/api/fetchProject");
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data);
                } else {
                    console.error("Failed to fetch projects");
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadProjects();
    }, []);

    return (
        <>
            <Sidebar collapsible="icon" variant="floating">
                <SidebarHeader>
                    Logo
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>
                            Applications
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            {items.map(item => {
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url} className={cn({
                                                '!bg-primary !text-white': pathname == item.url
                                            })}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarGroup>
                        <SidebarGroupLabel>
                            Your Projects
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {projects.map(item => {
                                    return (
                                        <SidebarMenuItem key={item.projectId}>
                                            <SidebarMenuButton asChild>
                                                <div className="cursor-pointer" onClick={() => handleProjectSelect(item)}>
                                                    <div className={cn(
                                                        'rounded-sm text sm border size-6 flex items-center justify-center bg-white text-primary',
                                                        {
                                                            '!bg-primary !text-white': item.projectId == currentProject?.projectId
                                                        }
                                                    )}>
                                                        {item.name[0]}
                                                    </div>
                                                    {open && <span>{item.name}</span>}
                                                </div>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                                <div className="h-2"></div>
                                {open &&
                                    <SidebarMenuItem>
                                        <Link href="/create">
                                            <Button size='sm' variant={"outline"} className="w-fit">
                                                <span><Plus /></span>Create Project
                                            </Button>
                                        </Link>
                                    </SidebarMenuItem>}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar >
        </>
    )
}