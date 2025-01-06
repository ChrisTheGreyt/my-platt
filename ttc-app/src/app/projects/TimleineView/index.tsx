import React, { useMemo, useState, useEffect } from 'react'
import { Task, useGetTasksQuery, useGetAuthUserQuery } from '@/state/api'
import { useAppSelector } from '@/state/hooks';
import "gantt-task-react/dist/index.css";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import Header from '@/components/Header';
import { useSelector } from 'react-redux';
import { RootState } from '@/state/store';
import { Auth } from "aws-amplify";

type Props = {
    id: string;
    setIsModalNewTaskOpen: ( isOpen: boolean ) => void;
};

type TaskTypeItems = "task" | "milestone" | "project";
const ADMIN_COGNITO_IDS = [
    "b4d80438-b081-7025-1adc-d6f95479680f", // Replace with actual admin IDs
    "74488448-c071-70b0-28db-644fc67f3f11",
  ];

const initialState = {
    userDetails: null,
};

const Timeline = ({ id, setIsModalNewTaskOpen }: Props) => {
    const isDarkMode = useAppSelector(( state ) => state.global.isDarkMode);
    const { data: tasks, error, isLoading } = useGetTasksQuery({ projectId: Number(id) });

    const userId = useAppSelector((state: RootState) => state.auth.userDetails?.userId ?? null);
    const [isAdmin, setIsAdmin] = useState(false);

    console.log('Resolved userId:', userId);
    console.log('isAdmin:', isAdmin);

    const [ displayOptions, setDisplayOptions ] = useState<DisplayOption>({
        viewMode: ViewMode.Month,
        locale: "en-us"
    })

    const ganttTasks = useMemo(() => {
        return(
            tasks?.map(( task) =>({
                start: new Date( task.startDate as string ),
                end: new Date( task.dueDate as string ),
                name: task.title,
                id: `Task-${task.id}`,
                type: "task" as TaskTypeItems,
                progress: task.points ? ( task.points /10)* 100: 0,
                isDisabled: false
            })) || []
        )
    }, [tasks]);

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

    const handleViewModeChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setDisplayOptions(( prev ) =>({
            ...prev,
            viewMode: event.target.value as ViewMode,
        }));
    };

    if ( isLoading ) return <div>Loading...</div>;
    if ( error ) return <div>An Error occured while fetching list</div>

  return (
    <div className='px-4 xl:px-6'>
        <div className='flex flex-wrap items-center justify-between gap-2 py-5'>
            <h1 className='me-2 text-lg font-bold dark:text-white'>
                Application Task Timeline
            </h1>
            <div className='relative inline-block w-64'>
                <select 
                    className='focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white'
                    value = { displayOptions.viewMode }
                    onChange = { handleViewModeChange }    
                >
                    <option value={ ViewMode.Day }>Day</option>
                    <option value={ ViewMode.Week }>Week</option>
                    <option value={ ViewMode.Month }>Month</option>

                </select> 
            </div>
        </div>

        <div className='overflow-x-auto rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white'>
            <div className='timeline'>
                <Gantt
                    tasks = { ganttTasks }
                    {...displayOptions }
                    columnWidth={ displayOptions.viewMode === ViewMode.Month ? 150 : 100 }
                    listCellWidth='100px' 
                    barBackgroundColor={ isDarkMode ? "#101214" : "#aeb8c2" }
                    barBackgroundSelectedColor={ isDarkMode ? '#000' : '#9ba1a6' }
                />
            </div>
            <div className='px-4 pb-5 pt-1'>
                {isAdmin && (
                    <button 
                        className='flex item-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600 opacity-1'
                        onClick={() => setIsModalNewTaskOpen( true )}
                    >
                        Add Task
                    </button>
                )}
            </div>
            
        </div>
    </div>
  )
}

export default Timeline