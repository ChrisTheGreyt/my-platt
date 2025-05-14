// src/components/Sidebar/index.tsx

"use client";
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import Button from '@/components/Button';
import { setIsSidebarCollapsed } from '@/state';
import { useGetAuthUserQuery, useGetProjectsQuery, useGetUserSchoolsQuery, useCreateSchoolMutation, useAddUserSchoolMutation } from '@/state/api';
import { AlertCircle, AlertOctagon, AlertTriangle, Briefcase, ChevronDown, ChevronUp, Home, Layers3, LockIcon, LucideIcon, School, Search, Settings, ShieldAlert, User, Users, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import NewSchoolModal from '@/components/ModalNewSchool';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { isAdmin } from '@/utils/adminUtils';


type Project = {
  id: number;
  name: string;
  description?: string;
};


const Sidebar = () => {
  // State declarations
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [internalUserId, setInternalUserId] = useState<string | null>(null);
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Hooks
  const { user, setUser, setSession } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const { 
    data: userSchools, 
    isLoading: isLoadingSchools, 
    error: schoolsError, 
    refetch: refetchSchools 
  } = useGetUserSchoolsQuery(
    internalUserId ? Number(internalUserId) : 0, 
    { 
      skip: !internalUserId,
      refetchOnMountOrArgChange: true, // Refetch when component mounts or userId changes
      pollingInterval: 5000 // Poll every 5 seconds for updates
    }
  );
  
  const [createSchool] = useCreateSchoolMutation();
  const [addUserSchool] = useAddUserSchoolMutation();

  // Fetch projects when user auth state changes
  useEffect(() => {
    const fetchProjects = async () => {
      console.log("Starting project fetch with user:", user);
      if (!user) {
        console.log("No authenticated user found");
        setIsLoading(false);
        return;
      }
    
      try {
        setIsLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    
        const authUser = await Auth.currentAuthenticatedUser();
        const cognitoSub = authUser.attributes.sub;
    
        console.log("Resolving userId using cognitoSub:", cognitoSub);
        if (!cognitoSub) throw new Error('No cognito id available');
    
        // First get user details including createdAt
        const userResponse = await fetch(
          `${backendUrl}/api/users/resolve?cognitoSub=${cognitoSub}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );
        const userData = await userResponse.json();
    
        if (!userData.userId) throw new Error("Invalid user data: Missing userId");
        setInternalUserId(userData.userId);
    
        // Get projects with time-gating applied
        const projectsResponse = await fetch(
          `${backendUrl}/api/users/${userData.userId}/time-gated-projects`
        );
    
        if (!projectsResponse.ok) {
          throw new Error(`HTTP error! status: ${projectsResponse.status}`);
        }
    
        const projectsData = await projectsResponse.json();
        console.log("✅ Received projects data:", projectsData);
        setProjects(projectsData);
      } catch (error) {
        console.error("🔥 Error in projects fetch chain:", error);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [user]);

  // Debug logging
  useEffect(() => {
    console.log("Fetched Projects:", projects);
    console.log("!!!Final projects loaded in Sidebar:", projects);
  }, [projects]);

  useEffect(() => {
    console.log("user:", user);
    console.log("projects:", projects);
  }, [user, projects]);

  useEffect(() => {
    console.log("🔍 Sidebar Fetch Projects: Internal User ID:", internalUserId);
  }, [internalUserId]);
  
  useEffect(() => {
    console.log("🔍 Sidebar Projects:", projects);
  }, [projects]);
  

  // Add effect to refetch when schools change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchSchools();
      }
    };

    // Refetch when tab becomes visible
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchSchools]);

  // Add this effect to check admin status when user changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser();
        const cognitoSub = currentUser.attributes.sub;
        console.log("🔍 Checking admin status for Cognito ID:", cognitoSub);
        console.log("🔍 User attributes:", currentUser.attributes);
        const isAdminUser = isAdmin(cognitoSub);
        console.log("🔍 Is user admin?", isAdminUser);
        console.log("🔍 Expected admin IDs:", ["b4d80438-b081-7025-1adc-d6f95479680f", "74488448-c071-70b0-28db-644fc67f3f11"]);
        setIsUserAdmin(isAdminUser);
      } catch (error) {
        console.error("Failed to fetch authenticated user:", error);
        setIsUserAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      setUser(null);
      setSession(null);
      dispatch(setIsSidebarCollapsed(true)); // Collapse sidebar on sign out
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const currentUserDetails = user || null;

  const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between shadow-xl transition-all duration-300 h-full z-40 dark:bg-black overflow-y-auto bg-white ${
    isSidebarCollapsed ? 'w-0 hidden' : 'w-64'
  }`;

  if (!currentUserDetails) return null;

  return (
    <div className={sidebarClassNames} key={currentUserDetails.username}>
      <div className='flex h-[100%] w-full flex-col justify-start'>
        {/* TOP LOGO */}
        <div className='z-50 flex min-h-[56px] w-64 items-center justify-between bg-white px-6 pt-3 dark:bg-black'>
          <div className='text-xl font-bold text-gray-800 dark:text-white'>MyPLATT</div>
          {!isSidebarCollapsed && (
            <button className='py-3' onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}>
              <X className='h-6 w-6 text-gray-800 hover:text-gray-500 dark:text-white' />
            </button>
          )}
          {showModal && (
            <NewSchoolModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onSchoolSelect={async (schoolId) => {
                if (!internalUserId) {
                  console.error('No user ID available');
                  return;
                }
                try {
                  await addUserSchool({ userId: Number(internalUserId), schoolId: Number(schoolId) }).unwrap();
                  
                  setTimeout(() => {
                    console.log("Refetching user schools...");
                    refetchSchools();
                  }, 500);
              
                  setShowModal(false);
                } catch (error) {
                  console.error('Error adding user school:', error);
                }
              }}
              
            />
          )}
    </div> 
     
        {/* USER INFO */}
        {currentUserDetails ? (
          <div className='flex items-center gap-5 border-y-[1.5px] border-gray-200 px-7 py-4 dark:border-gray-700'>
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
          <SidebarLink icon={Home} label="Home" href="/home" />
          {/* <SidebarLink icon={Briefcase} label="Timeline" href="/timeline" /> */}
          <SidebarLink icon={Search} label="Search" href="/search" />
          <SidebarLink icon={Settings} label="Settings" href="/settings" />
          <SidebarLink icon={Briefcase} label="Schools" href="/schools" />
        </nav>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-8 py-3">
            <h4 className="text-gray-700 dark:text-gray-300 font-medium">Schools</h4>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white hover:bg-gray-50 shadow-sm hover:shadow px-3 py-1 rounded-md text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-all duration-200"
            >
              + Add
            </button>
          </div>
          
          {isLoadingSchools ? (
            <div className="px-8 py-4 text-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
              </div>
            </div>
          ) : schoolsError || !userSchools || userSchools.length === 0 ? (
            <div className="px-8 py-4 text-sm text-gray-500 italic">
              No Schools Selected
            </div>
          ) : (
            <div className="space-y-1">
              {userSchools && userSchools.map((school) => (
                <SidebarLink
                  key={school.id}
                  icon={School}
                  label={school.school}
                  href={`/schools/${encodeURIComponent(school.school)}`}
                  isHighlighted={school.isSelected}
                />
              ))}
            </div>
          )}

        </div>

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
        ) : isLoading ? (
          <div className="px-8 py-4 text-sm">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ) : (
          <div className='px-8 py-2 text-sm text-red-500 dark:text-red-400'>
           
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

        {/* ADMIN SECTION */}
        {isUserAdmin && (
          <>
            <button 
              onClick={() => setShowAdmin((prev) => !prev)} 
              className='flex w-full items-center justify-between px-8 py-3 text-gray-500'
            >
              <span className=''>Admin</span>
              {showAdmin ? <ChevronUp className='h-5 w-5' /> : <ChevronDown className='h-5 w-5' />}
            </button>

            {showAdmin && (
              <>
                <SidebarLink icon={Users} label="Users" href="/users" />
                <SidebarLink icon={School} label="Manage Schools" href="/admin/schools" />
              </>
            )}
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
  isHighlighted?: boolean;
}

const SidebarLink = ({ href, icon: Icon, label, isHighlighted }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href} className='w-full'>
      <div
        className={`
          relative flex cursor-pointer items-center gap-3 transition-all duration-200
          justify-start px-8 py-3
          ${isActive ? 'bg-gray-100 dark:bg-gray-600' : ''}
          ${isHighlighted ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
          hover:bg-gray-100 dark:hover:bg-gray-700
        `}
      >
        {isActive && <div className='absolute left-0 top-0 h-full w-[5px] bg-blue-500' />}
        {isHighlighted && !isActive && (
          <div className='absolute left-0 top-0 h-full w-[5px] bg-blue-300' />
        )}
        <Icon className={`h-6 w-6 ${
          isHighlighted ? 'text-blue-500 dark:text-blue-400' : 'text-gray-800 dark:text-gray-100'
        }`} />
        <span className={`font-medium ${
          isHighlighted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-100'
        }`}>
          {label}
        </span>
      </div>
    </Link>
  );
};

export default Sidebar;
