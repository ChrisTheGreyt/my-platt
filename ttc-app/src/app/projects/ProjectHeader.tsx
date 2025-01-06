import Header from '@/components/Header';
import { Clock, Filter, Grid3x3, List, PlusSquare, Share2, Table } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import ModalNewProject from './ModalNewProject';
import { useAppSelector } from '@/state/hooks';
import { RootState } from '@/state/store';
import { Auth } from 'aws-amplify';
import ModalNewTask from '@/components/ModalNewTask';
import { useGetTasksQuery } from '@/state/api';

type Props = {
  activeTab: string;
  setActiveTab: ( tabName: string ) => void
  id?: string;
  setIsModalNewTaskOpen: ( isOpen: boolean ) => void;
  
};
const ADMIN_COGNITO_IDS = [
  "b4d80438-b081-7025-1adc-d6f95479680f", // Replace with actual admin IDs
  "74488448-c071-70b0-28db-644fc67f3f11",
];


const initialState = {
  userDetails: null,
};

const ProjectHeader = ({ activeTab, setActiveTab, id}: Props) => {
  const  [ isModalNewProjectOpen, setIsModalNewProjectOpen ] = useState(false);
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const userId = useAppSelector((state: RootState) => state.auth.userDetails?.userId ?? null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: tasks, error, isLoading } = useGetTasksQuery({ projectId: Number(id) });
    console.log('Resolved userId:', userId);
    console.log('isAdmin:', isAdmin);
    console.log("curernt project id:", id );
    useEffect(() => {
      const checkAdminStatus = async () => {
        try {
          const currentUser = await Auth.currentAuthenticatedUser();
          const cognitoSub = currentUser.attributes.sub;
  
          // Check if the user's Cognito ID exists in the admin list
          const isAdminUser = ADMIN_COGNITO_IDS.includes(cognitoSub);
          setIsAdmin(isAdminUser);
        } catch (error) {
          console.error("Failed to fetch authenticated user:", error);
        }
      };
  
      checkAdminStatus();
    }, []);

  return(
  <div className='px-4 xl:px-6'> 
    <ModalNewTask 
      isOpen={isModalNewTaskOpen} 
      onClose={() => setIsModalNewTaskOpen(false)} 
      id={id} // Pass project ID as a string or null if undefined
    />

    {/* MODAL NEW PROJECT */}
    <ModalNewProject  isOpen={isModalNewProjectOpen} onClose={() => setIsModalNewProjectOpen(false)}  />
    
    <div className='pb-6 pt-6 lg:pb-4 lg:pt-8'>
      {isAdmin && (
        <Header name = "Application Submission Dashboard"
          buttonComponent={
            <>
              <button className='flex items-center rounded-md bg-blue-primary px-3 py-2 text-white hover:bg-blue-600 opacity-1'
                onClick={() => setIsModalNewProjectOpen( true )}
              >
              <PlusSquare className='mr-2 h-5 w-5' /> New Project
              </button>
            </>
          }/>
        )}
    </div>
    <div className='px-4 pb-5 pt-1'>
        
            
        
    </div>   
    {/* TABS */}
    <div className='flex flex-wrap-reverse gap-2 border-y border-gray-200 pb-[8px] pt-2 dark:border-stroke-dark md:items-center'>
      <div className='flex flex-1 items-center gap-2 md:gap-4'>
      <TabButton 
          name="Board"
          icon = { <Grid3x3 className='h-5 w-5' /> }
          setActiveTab = { setActiveTab }
          activeTab = { activeTab }
          />
      <TabButton 
          name="List"
          icon = { <List className='h-5 w-5' /> }
          setActiveTab = { setActiveTab }
          activeTab = { activeTab }
          />
      <TabButton 
          name="Timeline"
          icon = { <Clock className='h-5 w-5' /> }
          setActiveTab = { setActiveTab }
          activeTab = { activeTab }
          />
        <TabButton 
          name="Table"
          icon = { <Table className='h-5 w-5' /> }
          setActiveTab = { setActiveTab }
          activeTab = { activeTab }
          />
      </div>
      <div className='flex items-center gap-2'>
        {isAdmin && (
          <button 
          className='flex item-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600 opacity-1'
          onClick={() => setIsModalNewTaskOpen( true )}
        >
          Add Task
        </button>
        )}
        <button className='text-gray-500 hover:text-gray-600 dark:tet-neutral-500 dark:hover:text-gray-300'>
          <Filter className='h-5 w-5' />
        </button>
        <button className='text-gray-500 hover:text-gray-600 dark:tet-neutral-500 dark:hover:text-gray-300'>
          <Share2 className='h-5 w-5' />
        </button>
        <div className='relative'>
          <input type='text' placeholder='Search Task' className='rounded-md border py-1 pl-10 pr-4 focus: outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white' />
            <Grid3x3 className='absolute left-3 top-2 h-4 w-4 text-gray-400 dark:text-neutral-500' />
        </div>
      </div>
    </div>
  </div>
  );
};

type TabButtonProps = {
  name: string;
  icon: React.ReactNode;
  setActiveTab: ( tabName: string ) => void;
  activeTab: string;
}

const TabButton = ({ name, icon, setActiveTab, activeTab }: TabButtonProps) => {
  const isActive = activeTab === name;

  return(
    <button
      className={`relative flex items-center gap-2 px-1 py-2 text-gray-500 after:absolute after:-bottom-[9px] after:left-0 after:h-[1px] after:w-full hover:text-blue-600 dark:text-neutral-500 dark:hover:text-white sm:px-2 lg:px-4 ${
        isActive ? 'text-blue-600 after:bg-blue-600 dark:text-white' : ''
      }`}
      onClick={() => setActiveTab( name )}
    >
      {icon}
      {name}
    </button>
  )
}

export default ProjectHeader