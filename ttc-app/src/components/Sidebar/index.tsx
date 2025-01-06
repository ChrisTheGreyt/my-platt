// src/components/Sidebar/index.tsx

"use client";
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import { setIsSidebarCollapsed } from '@/state';
import { useGetAuthUserQuery, useGetProjectsQuery } from '@/state/api';
import { AlertCircle, AlertOctagon, AlertTriangle, Briefcase, ChevronDown, ChevronUp, Home, Layers3, LockIcon, LucideIcon, Search, Settings, ShieldAlert, User, Users, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';


type Project = {
  id: number;
  name: string;
  description?: string;
};


const Sidebar = () => {

  const [userId, setUserId] = useState<string | null>(null);
  const [userSub, setUserSub] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  

  useEffect(() => {
    const fetchUserSub = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const cognitoId = user.attributes.sub; // Cognito userSub
        
        setUserSub(cognitoId);
      } catch (error) {
        console.error("Failed to fetch userSub:", error);
      }
    };

    fetchUserSub();
  }, []);

  // Step 2: Fetch userId from the backend using userSub
  useEffect(() => {
    const fetchUserId = async () => {
      if (!userSub) return;

      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/users/resolve?cognitoSub=${userSub}`);

        if (!response.ok) {
          console.error("Failed to fetch userId:", response.statusText);
          return;
        }

        const data = await response.json();
        setUserId(data.userId);
      } catch (error) {
        console.error("Error fetching userId:", error);
      }
    };

    fetchUserId();
  }, [userSub]);

  // Step 3: Fetch projects using userId
  // useEffect(() => {
  //   const fetchProjects = async () => {
  //     if (!userId) return;

  //     try {
  //       const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  //       const response = await fetch(`${backendUrl}/api/users/${userId}/projects`);

  //       if (!response.ok) {
  //         console.error("Failed to fetch projects:", response.statusText);
  //         return;
  //       }

  //       const data: Project[] = await response.json();
  //       setProjects(data);
  //     } catch (error) {
  //       console.error("Error fetching projects:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchProjects();
  // }, [userId]);
  

 
  
  const router = useRouter();
  const { setUser, setSession } = useAuth();
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  // Fetching user data and projects
  const { data: authData, isLoading: authLoading } = useGetAuthUserQuery();
  // const { data: projects, isLoading: projectsLoading } = useGetProjectsQuery();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId) return;
  
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/time-gated?userId=${userId}`
        );
  
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("Fetched Projects for Sidebar:", data);
        setProjects(data); // Save projects in state
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
  
    fetchProjects();
  }, [userId]);
  
  
  
  console.log("!!!Fetched", userId);

  useEffect(() => {
      console.log("Fetched Projects:", projects); // Debugging the projects state
    }, [projects]); 

  // Debugging outputs
  useEffect(() => {
    console.log("authData:", authData);
    console.log("projects:", projects);
  }, [authData, projects]);

  const currentUserDetails = authData?.userDetails || null;

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      setUser(null);
      setSession(null);
      router.push('/'); // Redirect to login page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };


  const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between shadow-xl transition-all duration-300 h-full z-40 dark:bg-black overflow-y-auto bg-white ${
    isSidebarCollapsed ? 'w-0 hidden' : 'w-64'
  }`;

  return (
    <div className={sidebarClassNames}>
      <div className='flex h-[100%] w-full flex-col justify-start'>
        {/* TOP LOGO */}
        <div className='z-50 flex min-h-[56px] w-64 items-center justify-between bg-white px-6 pt-3 dark:bg-black'>
          <div className='text-xl font-bold text-gray-800 dark:text-white'>MyPLATT</div>
          {!isSidebarCollapsed && (
            <button className='py-3' onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}>
              <X className='h-6 w-6 text-gray-800 hover:text-gray-500 dark:text-white' />
            </button>
          )}
        </div>
     
        {/* USER INFO */}
        {currentUserDetails ? (
          <div className='flex items-center gap-5 border-y-[1.5px] border-gray-200 px-7 py-4 dark:border-gray-700'>
            <Image src="https://mp-s3-images.s3.us-east-1.amazonaws.com/logo.png" alt="Logo" width={40} height={50} />
            <div>
              <h3 className='text-md font-bold tracking-wide dark:text-gray-200'>{currentUserDetails.username}</h3>
              <div className='mt-1 flex items-start gap-2'>
                <LockIcon className='mt-[0.1rem] h-3 w-3 text-gray-500 dark:text-gray-400' />
                <p className='text-xs text-gray-500'>Private</p>
              </div>
            </div>
          </div>
        ) : (
          <div className='p-4 text-center text-gray-500'>{User.name}</div>
        )}

        {/* NAVIGATION LINKS */}
        <nav className='z-10 w-full'>
          <SidebarLink icon={Home} label="Home" href="/" />
          <SidebarLink icon={Briefcase} label="Timeline" href="/timeline" />
          <SidebarLink icon={Search} label="Search" href="/search" />
          <SidebarLink icon={Settings} label="Settings" href="/settings" />
          <SidebarLink icon={User} label="User" href="/users" />
          <SidebarLink icon={Users} label="Users" href="/teams" />
          
        </nav>
        {/* PROJECTS SECTION */}
        <button
          onClick={() => setShowProjects((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
        >
          <span className=''>Projects</span>
          {showProjects ? <ChevronUp className='h-5 w-5' /> : <ChevronDown className='h-5 w-5' />}
        </button>

        {showProjects && projects.length > 0 ? (
          projects.map((project) => (
            <SidebarLink
              key={project.id}
              icon={Briefcase}
              label={project.name}
              href={`/projects/${project.id}`}
            />
          ))
        ) : (
          <div className='px-8 py-2 text-sm text-gray-500'>
            No Projects Available
          </div>
        )}
        {/* PRIORITY SECTION */}
        <button onClick={() => setShowPriority((prev) => !prev)} className='flex w-full items-center justify-between px-8 py-3 text-gray-500'>
          <span className=''>Priority</span>
          {showPriority ? <ChevronUp className='h-5 w-5' /> : <ChevronDown className='h-5 w-5' />}
        </button>

        {showPriority && (
          <>
            <SidebarLink icon={AlertCircle} label="Urgent" href="/priority/urgent" />
            <SidebarLink icon={ShieldAlert} label="High" href="/priority/high" />
            <SidebarLink icon={AlertTriangle} label="Medium" href="/priority/medium" />
            <SidebarLink icon={AlertOctagon} label="Low" href="/priority/low" />
            <SidebarLink icon={Layers3} label="Backlog" href="/priority/backlog" />
          </>
        )}
      </div>

      {/* SIGN OUT BUTTON */}
      <div className='z-10 mt-32 flex w-full flex-col items-center gap-4 bg-white px-8 py-4 dark:bg-black md:hidden'>
        <button className='self-start rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500' onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
  const pathname = usePathname(); // Get current pathname
  const isActive = pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href} className='w-full'>
      <div className={`relative flex cursor-pointer items-center gap-3 transition-color hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 ${isActive ? 'bg-gray-100 text-white dark:bg-gray-600' : ''} justify-start px-8 py-3`}>
        {isActive && <div className='absolute left-0 top-0 h-full w-[5px] bg-blue-200' />}
        <Icon className='h-6 w-6 text-gray-800 dark:text-gray-100' />
        <span className='font-medium text-gray-800 dark:text-gray-100'>{label}</span>
      </div>
    </Link>
    
  );
};

export default Sidebar;
