import React, { useEffect, useState, useRef} from "react";
import { Auth } from 'aws-amplify'; // Import Auth for Cognito
import {
  useUpdateUserTaskStatusMutation,
  useCreateUserTaskMutation,
  useGetBoardViewTasksQuery,
  Task as TaskType,
  Status,
  Priority,
} from "@/state/api";
import { DndProvider, useDrop, useDrag } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { EllipsisVertical, MessageSquareMore, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { skipToken } from "@reduxjs/toolkit/query/react";
import Image from "next/image";
import { format } from "date-fns";
import Linkify from 'react-linkify';
import ReactMarkdown from "react-markdown";
import EditTaskModal from "@/components/ModalEditTask";
import { toast } from "react-hot-toast";




type BoardProps = {
    id: string;
    setIsModalNewTaskOpen: (isOpen: boolean) => void;
    authData: any; // Replace `any` with the appropriate type for authData
    projects: any[]; // Replace `any[]` with the appropriate type for projects
  };

  
  type Task = {
    id: number;
    title: string;
    description: string;
    tags: string;
    startDate?: string; // Changed from string | null
    dueDate?: string; // Changed from string | null
    points: number;
    projectId: number;
    authorUserId?: number; // Allow undefined but not null
    assignedUserId?: number; // Allow undefined but not null
    attachments?: any[];
    status: Status;
    priority: Priority;
  };
  
  type NestedUserTask = {
    id: number;
    task: Task; // For 2025 track with nested task object
    status: Status;
    priority: Priority;
  };
  
  type FlatUserTask = Task & {
    // For 2026 track with flat structure
    status: Status;
    priority: Priority;
  };
  
  type CombinedTask = {
    id: number;
    title: string;
    description: string;
    tags: string;
    startDate?: string; // Use undefined instead of null
    dueDate?: string;   // Use undefined instead of null
    points: number;
    projectId: number;
    authorUserId?: number; // Allow undefined but not null
    assignedUserId?: number; // Allow undefined but not null
    attachments?: any[];
    status: Status;
    priority: Priority;
  };
  
  
  
const STATUS_MAPPING = {
  "To Do": "TO_DO",
  "Work In Progress": "WORK_IN_PROGRESS",
  "Under Review": "UNDER_REVIEW",
  "Completed": "COMPLETED"
} as const;

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];
const linkDecorator = (href: string, text: string, key: number) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-500 hover:text-blue-700"
    key={key}
  >
    {text}
  </a>
);

const BoardView: React.FC<BoardProps> = ({ id, setIsModalNewTaskOpen, authData, projects }) => {
  const userId = authData?.userDetails?.userId || null;
  const selectedTrack = authData?.userDetails?.selectedTrack || null;
  const projectId = id ? Number(id) : null;
    const [isAdmin, setIsAdmin] = useState(false);
    const ADMIN_COGNITO_IDS = [
      "b4d80438-b081-7025-1adc-d6f95479680f",
      "74488448-c071-70b0-28db-644fc67f3f11",
    ];
    // Flag to ensure we only call setup once.
    const [hasSetup, setHasSetup] = useState(false);

    const { data: userTasks, refetch, isLoading, isFetching, error } = useGetBoardViewTasksQuery(
      userId && projectId ? { userId, projectId } : skipToken
    );

    const hasSetupRef = useRef(false);
    const hasInitializedRef = React.useRef(false);
    
    useEffect(() => {
      const checkAdminStatus = async () => {
        try {
          const currentUser = await Auth.currentAuthenticatedUser();
          const cognitoSub = currentUser.attributes.sub;
          const isAdminUser = ADMIN_COGNITO_IDS.includes(cognitoSub);
          setIsAdmin(isAdminUser);
          console.log("You Are The Captin Now", cognitoSub);
        } catch (error) {
          console.error("Failed to fetch authenticated user:", error);
        }
      };
      checkAdminStatus();
    }, []);
    
    useEffect(() => {
        console.log('authData!!!!:', authData);
      }, [authData]);
    // const selectedTrack = authData?.userDetails?.selectedTrack || null;
    // const projectId = id ? Number(id) : null;
    // const userId = authData?.userDetails?.userId || null;
    // const selectedTrack = authData?.userDetails?.selectedTrack || null;
    console.log("userId:", userId);
    console.log("projectId:", projectId);
    console.log("selectedTrack:", selectedTrack);

    console.log("userId before query:", userId);
    console.log("projectId before query:", projectId);
    console.log("Executing useGetUserTasksQuery with parameters:", { userId, projectId });
    // const { data: userTasks, refetch, isFetching, isLoading, error } = useGetBoardViewTasksQuery(
    //     userId && projectId ? { userId: 28, projectId } : skipToken
    // );

    // Add debugging for query parameters and response
    console.log("Query Parameters:", { userId, projectId });
    console.log("UserTasks Response:", userTasks);
    if (userTasks) {
        userTasks.forEach((task, index) => {
            console.log(`Task ${index}:`, task);
        });
    }
    console.log("Query Status:", { isFetching, isLoading, error });

    const [updateUserTaskStatus] = useUpdateUserTaskStatusMutation();
    const [createUserTask] = useCreateUserTaskMutation();

    const [selectedTask, setSelectedTask] = React.useState<TaskType | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    useEffect(() => {
        console.log("authData received in BoardView:", authData);
        console.log("projects received in BoardView:", projects);
        console.log("userTasks received in BoardView:", userTasks); // Log detailed structure
        if (userTasks && Array.isArray(userTasks)) {
          console.log("Sample Task:", userTasks[0]); // Log the first task to inspect structure
        }
      }, [authData, projects, userTasks]);

      useEffect(() => {
        console.log("userTasks:", userTasks);
      }, [userTasks]);

      const hasRunSetup = useRef(false);

      // Ensure user tasks are initialized if missing
      // Setup tasks only if they are empty and we haven't set them up yet.
      useEffect(() => {
        const setupUserTasks = async () => {
          if (!userId || !selectedTrack) {
            console.error("Missing userId or selectedTrack");
            return;
          }
      
          try {
            const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
            const response = await fetch(`${backendUrl}/api/tasks/user-tasks/setup`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, selectedTrack }),
            });
      
            if (!response.ok) {
              throw new Error("Failed to set up user tasks");
            }
      
            console.log("User tasks set up successfully.");
            refetch();
            hasInitializedRef.current = true;
          } catch (error) {
            console.error("Error in setupUserTasks:", error);
          }
        };
      
        // Only initialize if tasks are empty or less than expected and we haven't already initialized.
        if (userId && selectedTrack && !hasInitializedRef.current) {
          // Optionally, check if (userTasks?.length ?? 0) is less than expected count.
          setupUserTasks();
        }
      }, [userId, selectedTrack, userTasks, refetch]);
    

    // Handle loading/error states
    if (isLoading || isFetching) return <div>Loading tasks...</div>;
    if (error) return <div>An error occurred while fetching tasks.</div>;
    // if (!userTasks || userTasks.length === 0) {
    //     return <div>No tasks available for this project.</div>;
    // }

    // Task Udate modal 
    const handleEditTask = (task: TaskType) => {
      console.log('Task ID:', task.id); // Should log the correct task ID
  console.log('Task Data:', task); // Logs the full task object
      setSelectedTask(task);
      setIsEditModalOpen(true);
    };
    
    const handleUpdateTask = async (taskId: number, updatedData: any) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/tasks/${taskId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
          }
        );
    
        if (!response.ok) {
          throw new Error("Failed to update task");
        }
    
        const updatedTask = await response.json();
        console.log("Updated Task:", updatedTask);
    
        setIsEditModalOpen(false);
        refetch(); // Refresh tasks after update
      } catch (error) {
        console.error("Error updating task:", error);
      }
    };
    
    
    console.log("userTasks before processing:", userTasks);
    console.log("Raw userTasks data:", userTasks);
    const tasks = (userTasks || [])
      .filter((userTask) => {
        console.log("Filtering userTask:", userTask);
        return userTask.taskId !== null;
      })
      .map((userTask) => {
        console.log("Mapping userTask:", userTask);
        if (!userTask.task) {
          console.warn(`Missing task data for userTask with ID: ${userTask.id}`);
          return {
            id: -1,
            title: "Untitled Task",
            description: "No description available.",
            tags: "",
            startDate: "",
            dueDate: "",
            points: 0,
            projectId: -1,
            authorUserId: undefined,
            assignedUserId: undefined,
            attachments: [],
            status: "To Do" as Status,
            priority: "Medium" as Priority,
          };
        }
    
        const task = userTask.task;
        // Convert the backend status to display status
        const displayStatus = Object.entries(STATUS_MAPPING).find(
          ([_, value]) => value === userTask.status
        )?.[0] || "To Do";

        return {
          id: task.id,
          title: task.title || "Untitled Task",
          description: task.description || "No description available.",
          tags: task.tags || "",
          startDate: task.startDate || "",
          dueDate: task.dueDate || "",
          points: task.points || 0,
          projectId: task.projectId || 0,
          authorUserId: task.authorUserId ?? undefined,
          assignedUserId: task.assignedUserId ?? undefined,
          attachments: task.attachments || [],
          status: displayStatus as Status,
          priority: task.priority as Priority,
        };
      });

    console.log("Processed tasks:", tasks);
    console.log("Tasks to be rendered:", tasks);
    
      

  
   
  // Handle task updates
  const handleTaskUpdate = async (taskId: string, newStatus: string, position: number) => {
    if (!userId) return;

    try {
      const formattedStatus = STATUS_MAPPING[newStatus as keyof typeof STATUS_MAPPING];
      
      const result = await updateUserTaskStatus({
        userId,
        taskId: parseInt(taskId),
        status: formattedStatus,
        position
      }).unwrap();

      console.log('Update successful:', result);
      refetch();
      toast.success(`Task moved to ${newStatus}`);
    } catch (error: any) { // Type error as any since RTK Query error types are complex
      console.error('Error updating task:', error);
      toast.error(error?.data?.message || 'Failed to update task status');
    }
  };
  
  
  

  const ensureUserTaskExists = async (taskId: number) => {
    if (!userId) return;
    try {
      await createUserTask({ userId, taskId });
      refetch(); // Refresh tasks after creation
    } catch (error) {
      console.error("Error ensuring UserTask exists:", error);
    }
  };

  return (

    <DndProvider backend={HTML5Backend}>
  <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
    {taskStatus.map((status) => (
      <TaskColumn
        key={status}
        status={status}
        tasks={tasks.filter((task) => task.status === status)}
        moveTask={handleTaskUpdate}
        setIsModalNewTaskOpen={setIsModalNewTaskOpen}
        handleEditTask={handleEditTask}
        isAdmin={isAdmin}
      />
    ))}
  </div>
  <EditTaskModal
    isOpen={isEditModalOpen}
    onClose={() => setIsEditModalOpen(false)}
    task={selectedTask}
    onUpdateTask={handleUpdateTask}
  />
</DndProvider>




  );
};

type TaskColumnProps = {
  status: string;     
  tasks: TaskType[];
  moveTask: (taskId: string, newStatus: string, position: number) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  handleEditTask: (task: TaskType) => void;
  isAdmin: boolean;
};

const TaskColumn = ({ status, tasks, moveTask, setIsModalNewTaskOpen, handleEditTask, isAdmin }: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number; currentStatus: string }, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      // Don't update if the status hasn't changed
      if (item.currentStatus === status) {
        return;
      }
      moveTask(item.id.toString(), status, tasks.length);
    },
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  const tasksCount = tasks.filter((task) => task.status === status).length;
  const statusColor: Record<string, string> = {
    "To Do": "#2563EB",
    "Work In Progress": "#059669",
    "Under Review": "#D97706",
    Completed: "#000000",
  };

  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`sl:py-4 rounded-lg py-2 xl:px-2 ${isOver ? "bg-blue-100 dark:bg-neutral-950" : ""}`}
    >
      <div className="mb-3 flex w-full">
        <div
          className={`w-2 !bg-[${statusColor[status]}] rounded-s-lg`}
          style={{ backgroundColor: statusColor[status] }}
        />
        <div className="flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary">
          <h3 className="flex items-center text-lg font-semibold dark:text-white">
            {status}{" "}
            <span
              className="ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none dark:bg-dark-tertiary"
              style={{ width: "1.5rem", height: "1.5rem" }}
            >
              {tasksCount}
            </span>
          </h3>
          <div className="flex items-center gap-1">
            <button className="flex h-6 w-5 items-center justify-center dark:text-neutral-500">
              <EllipsisVertical size={26} />
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 dark:bg-dark-tertiary dark:text-white"
            //   onClick={() => setIsModalNewTaskOpen(true)}
              onClick={() => setIsModalNewTaskOpen(false)}

            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {tasks
        .filter((task) => task.status === status)
        .map((task) => (
          <Task key={task.id} task={task} handleEditTask={handleEditTask} isAdmin={isAdmin} />
        ))}
    </div>
  );
};

type TaskProps = {
  task: TaskType;
  handleEditTask: (task: TaskType) => void;
  isAdmin: boolean;
};

const Task = ({ task, handleEditTask, isAdmin}: TaskProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { 
      id: task.id,
      status: task.status,
      currentStatus: task.status 
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "P")
    : "";

  const numberOfComments = (task.comments && task.comments.length) || 0;

  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => (
    <div
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
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
      {priority}
    </div>
  );

  return (
    <div
      ref={(instance) => {
        drag(instance);
      }}
      className={`mb-4 rounded-md bg-white shadow dark:bg-dark-secondary ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {task.attachments && task.attachments.length > 0 && (
        <Image
        src = { `https://mp-s3-images.s3.us-east-1.amazonaws.com/${ task.attachments[ 0 ].fileURL }` }
          alt={task.attachments[0].fileName}
          width={400}
          height={200}
          className="h-auto w-full rounded-t-md"
        />
      )}

      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {task.priority && <PriorityTag priority={task.priority} />}
            <div className="flex gap-2">
              {taskTagsSplit.map((tag) => (
                <div
                  key={tag}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs"
                >
                  {" "}
                  {tag}
                </div>
              ))}
            </div>
          </div>
          {/* Conditionally Render Ellipsis for Admins */}
          {isAdmin && (
            <button className="flex h-6 w-4 flex-shrink-0 items-center justify-center dark:text-neutral-500"
                    onClick={() => handleEditTask(task)} 
            >
              <EllipsisVertical size={26} />
            </button>
          )}
        </div>
          

        <div className="my-3 flex justify-between">
          <h4 className="text-md font-bold dark:text-white">{task.title}</h4>
          {typeof task.points === "number" && (
            <div className="text-xs font-semibold dark:text-white">
              {task.points} pts
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-neutral-500">
          {formattedStartDate && <span>{formattedStartDate} - </span>}
          {formattedDueDate && <span>{formattedDueDate}</span>}
        </div>
        <p className="text-sm text-gray-600 dark:text-neutral-500">
        <ReactMarkdown
          components={{
            a: ({ href, children }) => href ? linkDecorator(href, children as string, task.id) : <>{children}</>,
          }}
        >{task.description}</ReactMarkdown>
        </p>
        <div className="mt-4 border-t border-gray-200 dark:border-stroke-dark" />

        {/* Users */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-[6px] overflow-hidden">
            {task.assignee && (
              <Image
                key={task.assignee.userId}
                src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${task.assignee.profilePictureUrl!}`}
                alt={task.assignee.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
              />
            )}
            {task.author && (
              <Image
                key={task.author.userId}
                src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${task.author.profilePictureUrl!}`}
                alt={task.author.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
              />
            )}
          </div>
          <div className="flex items-center text-gray-500 dark:text-neutral-500">
            <MessageSquareMore size={20} />
            <span className="ml-1 text-sm dark:text-neutral-400">
              {numberOfComments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


export default BoardView
