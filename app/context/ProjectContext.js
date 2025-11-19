"use client"
import { useUser } from '@clerk/nextjs';
import { createContext, useContext, useEffect, useState } from "react";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [currentProject, setCurrentProject] = useState({
    projectId: "",
    userId: "",
    name: "",
    projectUrl: ""
  });
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage only after hydration is complete
  useEffect(() => {
    if (!isUserLoaded || !user) return;
    
    try {
      const saved = localStorage.getItem(`OpsyProject_${user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCurrentProject(parsed);
      }
    } catch (error) {
      console.error("Failed to load project from localStorage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, [user, isUserLoaded]);

  // Save to localStorage
  useEffect(() => {
    if (!isHydrated || !user || !currentProject?.projectId) return;
    
    try {
      localStorage.setItem(`OpsyProject_${user.id}`, JSON.stringify(currentProject));
    } catch (error) {
      console.error("Failed to save project to localStorage:", error);
    }
  }, [currentProject, user, isHydrated]);

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject, isHydrated }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};