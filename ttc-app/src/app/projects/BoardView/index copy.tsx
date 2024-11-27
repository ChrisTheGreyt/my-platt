import { useUpdateUserTaskStatusMutation, useGetAuthUserQuery, useGetProjectsQuery, useCreateUserTaskMutation, useGetUserTasksQuery, Task as TaskType, Status, Priority } from '@/state/api';
import React, { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EllipsisVertical, MessageSquareMore, Plus } from 'lucide-react';
import { format } from "date-fns";
import Image from 'next/image';
import { Auth } from 'aws-amplify';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { RootState } from '@/state/store';


type BoardProps = {
    id: string;
    setIsModalNewTaskOpen: (isOpen: boolean) => void;
};
  
const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];

  
const BoardView = ({ id, setIsModalNewTaskOpen }: BoardProps) => {
    
    // Fetching authData and projects using RTK Query hooks
    const { data: authData, isLoading: authLoading, error: authError } = useGetAuthUserQuery();

    useEffect(() => {
        if (authData) {
          console.log("Fetched authData:", authData);
        }
      }, [authData]);
      

    const { data: projects, isLoading: projectsLoading, error: projectsError } = useGetProjectsQuery();

    const [updateUserTaskStatus] = useUpdateUserTaskStatusMutation();
    const [createUserTask] = useCreateUserTaskMutation();

    // Placeholder to store userId and projectId once fetched
    const userId = authData?.userDetails?.userId || null;
    const selectedTrack = authData?.userDetails?.selectedTrack || null;
    const projectId = id ? Number(id) : null;

    // Fetch user tasks based on userId and projectId
    const { data: userTasks, isFetching, refetch, isLoading, error } = useGetUserTasksQuery(
        userId && projectId ? { userId, projectId } : skipToken // Skip query if userId or projectId is invalid
    );

    // Debugging logs
    useEffect(() => {
        console.log("authData:", authData);
        console.log("projects:", projects);
        console.log("userTasks:", userTasks);
        console.log("userId:", userId, "selectedTrack:", selectedTrack, "projectId:", projectId);
    }, [authData, projects, userTasks]);


    // Handle loading state for authData or projectId
    if (!authData || !projectId) {
        console.log("Auth data or project ID is not available yet.");
        return <div>Loading...</div>;
    }

    // const filteredTasks = userTasks?.filter((task) => task.projectId === projectId) || [];

    
    
    
    useEffect(() => {
        if (authData && projectId && userId) {
            console.log("Refetching tasks for userId:", userId, "projectId:", projectId);
            refetch();
        }
    }, [authData, projectId, userId, refetch]);
    
      if (isFetching || !authData || !userId || !projectId) {
        return <div>Loading tasks...</div>;
      }

      
    // Ensure tasks are set up if they don't exist
    useEffect(() => {
        const setupUserTasks = async () => {
            if (!userId || !selectedTrack) {
                console.error("Missing userId or selectedTrack");
                return;
            }

            try {
                const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
                const response = await fetch(`${backendUrl}/tasks/user-tasks/setup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, selectedTrack }),
                });

                if (!response.ok) {
                    throw new Error('Failed to set up user tasks');
                }

                console.log('User tasks set up successfully.');
                refetch(); // Refetch tasks after setup
            } catch (error) {
                console.error('Error in setupUserTasks:', error);
            }
        };

        if (userId && selectedTrack && (!userTasks || userTasks.length === 0)) {
            setupUserTasks();
        }
    }, [userId, selectedTrack, userTasks, refetch]);

  
    // Move a task to a new status
    const moveTask = async (taskId: number, toStatus: string) => {
        if (!userId) return;
        try {
        console.log(`Moving task ${taskId} to status: ${toStatus}`);
        await updateUserTaskStatus({ userId: Number(userId), taskId, status: toStatus });
        refetch(); // Refetch tasks after status update
        } catch (error) {
        console.error("Error moving task:", error);
        }
    };
      
    // Ensure a user task exists before making updates
    const ensureUserTaskExists = async (taskId: number) => {
        if (!userId) return;
        try {
        await createUserTask({ userId: Number(userId), taskId });
        refetch(); // Refetch tasks after ensuring UserTask
        } catch (error) {
        console.error("Error ensuring UserTask exists:", error);
        }
    };
  
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>An error occurred while fetching tasks.</div>;
    if (!userTasks || userTasks.length === 0) {
        return <div>No tasks available for this project.</div>;
    }
    
    const tasks = userTasks
    ?.filter(userTask => userTask.task && userTask.task.id !== undefined) // Ensure valid task and id
    .map(userTask => ({
        id: userTask.task!.id, // Assert that id exists (safe after filtering)
        title: userTask.task!.title || '', // Ensure title is a string
        description: userTask.task!.description || '',
        tags: userTask.task!.tags || '',
        startDate: userTask.task!.startDate || '',
        dueDate: userTask.task!.dueDate || '',
        points: userTask.task!.points || 0,
        projectId: userTask.task!.projectId || 0,
        authorUserId: userTask.task!.authorUserId || null,
        assignedUserId: userTask.task!.assignedUserId || null,
        status: userTask.status || 'To Do',
        priority: userTask.priority || 'Medium',
    })) || [];




    return (
        <DndProvider backend={HTML5Backend}>
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
                {taskStatus.map((status) => (
                <TaskColumn
                    key={status}
                    status={status}
                    tasks={(userTasks || []).map((userTask) => {
                    if (!userTask.task) {
                        console.warn(`Task data is missing for userTask with ID ${userTask.id}`);
                        return {
                        id: -1,
                        title: "Untitled Task",
                        description: "",
                        tags: "",
                        startDate: "",
                        dueDate: "",
                        points: 0,
                        projectId: -1,
                        authorUserId: -1,
                        assignedUserId: -1,
                        attachments: [],
                        status: userTask.status as Status, // Cast to Status enum
                        priority: userTask.priority as Priority, // Cast to Priority enum if needed
                        };
                    }

                    return {
                        ...userTask.task,
                        status: userTask.status as Status, // Override with user-specific value
                        priority: userTask.priority as Priority, // Override with user-specific value
                    };
                    })}
                    moveTask={moveTask}
                    setIsModalNewTaskOpen={setIsModalNewTaskOpen}
                />
                ))}
            </div>
        </DndProvider>
      

      
    );
  };


  type TaskColumnProps = {
    status: string;
    tasks: TaskType[];
    moveTask: (taskId: number, toStatus: string) => void;
    setIsModalNewTaskOpen: (isOpen: boolean) => void;
  };  
  
const TaskColumn = ({
status,
tasks,
moveTask,
setIsModalNewTaskOpen,
}: TaskColumnProps) => {
const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor: any) => ({
    isOver: !!monitor.isOver(),
    }),
}));

const tasksCount = tasks.filter((task) => task.status === status).length;


const statusColor: any = {
    "To Do": "#2563EB",
    "Work In Progress": "#059669",
    "Under Review": "#D97706",
    Completed: "#000000",
};

    return(
        <div 
            ref = {( instance ) => {
                drop ( instance );
            }}
            className={ `sl:py-4 rounded-lg py-2 xl:px-2 ${ isOver ? "bg-blue-100 dark:bg-neutral-950" : "" }`}
        >
            <div className='mb-3 flex w-full'>
                <div className={ `w-2 !bg-[${statusColor[status]}] rounded-s-lg` }
                     style={{backgroundColor: statusColor[ status ] }}
                />
                <div className='flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary'>
                    <h3 className='flex items-center text-lg font-semibold dark:text-white'>
                        { status }{ " " }
                        <span className='ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none dark:bg-dark-tertiary' 
                            style = {{ width: "1.5rem", height: "1.4.rem" }}
                        >
                            { tasksCount }
                        </span>
                    </h3>
                    <div className='flex items-center gap-1'>
                        <button className='flex h-6 w-5 items-center justify-center dark:text-neutral-500'>
                            <EllipsisVertical size={ 26 } />
                        </button>
                        <button className='flex h-6 w-6 items-center justify-center rounded bg-gray-200 dark:bg-dark-tertiary dark:text-white'
                            onClick={() => setIsModalNewTaskOpen( true )}
                        >
                            <Plus size = { 16 } />
                        </button>
                    </div>
                </div>
            </div>

            { tasks
                .filter(( task ) => task.status === status)
                .map(( task ) => (
                    <Task key = { task.id } task = { task } />
                ))
            }
        </div>
    )
}

type TaskProps = {
    task: TaskType;
};

const Task = ({ task }: TaskProps ) => {
    const [{ isDragging }, drag ] = useDrag(() =>({
        type: "task",
        item: { id: task.id },
        collect: ( monitor: any  ) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    const taskTagsSplit = task.tags ? task.tags.split(",") : [];

    const formattedStartDate = task.startDate 
        ? format( new Date( task.startDate ), "P") 
        : "";
    
    const formattedDueDate = task.dueDate 
        ? format( new Date( task.dueDate ), "P") 
        : "";

    const numberOfComments = ( task.comments && task.comments.length ) || 0;

    const PriorityTag = ({ priority } : { priority: TaskType[ "priority" ]}) => (
        <div className={ `rounded-full px-2 py-1 text-xs font-semibold ${
            priority === "Urgent" 
                ? "bg-red-200 text-red-700" 
                : priority === "High" 
                    ? "bg-yellow-200 text-yellow-700"
                    : priority === "Medium"
                        ? "bg-green-200 text-green-700" 
                        : priority === "Low" 
                            ? "bg-blue-200 text-blue-700"
                            : "bg-gray-200 text-gray-700"
            }`}
        >
            { priority }
        </div>
    );

    return(
        <div 
            ref = {( instance ) => {
                drag( instance );
            }}
            className = { `mb-4 rounded-md bg-white shadow dark:bg-dark-secondary ${
                isDragging ? "opacity-50" : "opacity-100"
            }`}
        >
            { task.attachments && task.attachments.length > 0 && (
                <Image
                    src = { `https://mp-s3-images.s3.us-east-1.amazonaws.com/${task.attachments[ 0 ].fileURL }`}
                    alt = { task.attachments[ 0 ].fileName }
                    width = { 400 }
                    height = { 200 }
                    className='h-auto w-full rounded-t-md'
                />
            )}
            <div className='p-4 md:p-6'>
                <div className='flex items-start justify-between'>
                    <div className='flex flex-1 flex-wrap items-center gap-2'>
                        { task.priority && <PriorityTag priority= { task.priority } />}
                        <div className='flex gap-2'>
                            { taskTagsSplit.map(( tag ) => (
                                <div 
                                    key= { tag } 
                                    className='rounded-full bg-blue-100 px-2 py-1 text-xs'
                                >
                                    { " " }
                                    { tag }
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className='flex h-6 w-4 flex-shrink-0 items-center justify-center dark:text-neutral-500'>
                        <EllipsisVertical size = { 26 } />
                    </button>
                </div>

                <div className='my-3 flex justify-between'>
                    <h4 className='text-md font-bold dark:text-white'>{ task.title }</h4>
                    { typeof task.points === "number" && (
                        <div className='text-xs font-semibold dark:text-white'>
                            { task.points } pts
                        </div>
                    )}
                </div>

                <div className='text-xs text-gray-500 dark:text-neutral-500'>
                    { formattedStartDate && <span> { formattedStartDate }</span> }
                    { formattedDueDate && <span> { formattedDueDate }</span>}
                </div>
                <p className='text-xs text-gray-600 dark:text-neutral-500'>
                    { task.description }
                </p>
                <div className='mt-4 border-t border-gray-200 dark:border-stroke-dark' />
                
                { /* Users */ }
                <div className='mt-3 flex items-center justify-between'>
                    <div className='flex -space-x-[6px] overflow-hidden'>
                        { task.assignee && (
                            <Image 
                                key= {task.assignee.userId }
                                src = { `https://mp-s3-images.s3.us-east-1.amazonaws.com/${task.assignee.profilePictureUrl! }`} //! to makes sure it exisits
                                alt = { task.assignee.username }
                                width = { 30 }
                                height = { 30 }
                                className='h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary'
                            />
                        )}
                        { task.author && (
                            <Image 
                                key= {task.author.userId }
                                src = { `https://mp-s3-images.s3.us-east-1.amazonaws.com/${task.author.profilePictureUrl! }`} //! to makes sure it exisits
                                alt = { task.author.username }
                                width = { 30 }
                                height = { 30 }
                                className='h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary'
                            />
                        )}
                    </div>
                    <div className='flex itemss-center text-gray-500 dark:text-neutral-500'>
                        <MessageSquareMore size={ 20 } />
                        <span className='ml-1 text-sm dark:text-neutral-400'>
                            { numberOfComments }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
};


export default BoardView

function refetchUserTasks() {
    throw new Error('Function not implemented.');
}
