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
import { useRouter } from "next/navigation"

const items = [
    {
        title: "Dashboard",
        url: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: "Q&A",
        url: '/qa',
        icon: Bot
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
]

export function AppSidebar() {
    const router = useRouter()
    const pathname = usePathname();
    const { open } = useSidebar();
    const { user } = useUser();

    const [projects, setProjects] = useState([]);
    const { currentProject, setCurrentProject } = useProject();
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

    const handleProjectClick = (item) => {
        handleProjectSelect(item);
        router.push("/dashboard"); // navigate to dashboard
    };

    return (
        <>
            <Sidebar collapsible="icon" variant="floating">
                <SidebarHeader>
                    <div className="font-bold">Opsy</div>
                    {/* <img src="/logo.jpeg" alt="" className="h-10 w-10 rounded-full"/> */}
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
                                                <button
                                                    className="w-full cursor-pointer flex items-center gap-2"
                                                    onClick={() => handleProjectClick(item)}
                                                >
                                                    <div
                                                        className={cn(
                                                            "rounded-sm text sm border size-6 flex items-center justify-center bg-white text-primary",
                                                            {
                                                                "!bg-primary !text-white":
                                                                    item.projectId == currentProject?.projectId,
                                                            }
                                                        )}
                                                    >
                                                        {item.name[0]}
                                                    </div>

                                                    {open && <span>{item.name}</span>}
                                                </button>
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