'use client';

import { Auth } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SchoolHeader } from '../components/SchoolHeader';
import KanbanBoard, { TaskStatus } from '../components/KanbanBoard';
import { Toaster, toast } from 'react-hot-toast';
import { useGetSchoolByNameQuery, useUpdateSchoolTaskStatusMutation, School } from '@/state/api';

interface PageProps {
  params: {
    name: string;
  };
}

interface Task {
  id: string;
  schoolTaskId: number;
  userId: number;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  description?: string;
}


const SchoolPage = ({ params }: PageProps) => {
  const { name } = params;
  const decodedName = decodeURIComponent(name);
  const [internalUserId, setInternalUserId] = useState<string | null>(null);
  const router = useRouter();
  
  const { 
    data: schoolDetails, 
    refetch, 
    isLoading, 
    error 
  } = useGetSchoolByNameQuery({ 
    name: decodedName,
    userId: Number(internalUserId)
  }, {
    skip: !internalUserId
  });
  const [updateSchoolTaskStatus] = useUpdateSchoolTaskStatusMutation();
  const [userTasks, setUserTasks] = useState<Task[]>([]); // ✅ Define userTasks properly
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const [kanbanTasks, setKanbanTasks] = useState<Task[]>([]);

  // Fetch authenticated user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const cognitoId = user.attributes.sub;
        console.log("🔍 Cognito ID:", cognitoId);
  
        const response = await fetch(`${backendUrl}/users/by-cognito/${cognitoId}`);
        if (!response.ok) throw new Error("Failed to fetch user ID");
  
        const userData = await response.json();
        console.log("✅ Internal User ID:", userData.userId);
        setInternalUserId(userData.userId);
      } catch (error) {
        console.error("❌ Error fetching user ID:", error);
      }
    };
  
    fetchUserId();
  }, []);
  
  
  

  // Fetch user tasks for this school
  useEffect(() => {
    if (internalUserId) {
      const fetchUserTasks = async () => {
        try {
          const response = await fetch(`${backendUrl}/api/user-school-tasks/${internalUserId}`);
          if (!response.ok) throw new Error("Failed to fetch user tasks");

          const data = await response.json();
          setUserTasks(data.map((task: any) => ({ 
            ...task, 
            id: task.id.toString() // Convert to string instead of number
          })));
        } catch (error) {
          console.error("❌ Error fetching user tasks:", error);
        }
      };
      fetchUserTasks();
    }
  }, [internalUserId]);

  // Transform school tasks to Kanban tasks
  useEffect(() => {
    if (schoolDetails?.schoolTasks) {
      const tasks = schoolDetails.schoolTasks.map(schoolTask => ({
        id: schoolTask.id.toString(),
        title: schoolTask.taskType
          .split('_')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ') + (schoolTask.isRequired ? ' *' : ' (Optional)'),
        status: (schoolTask.userSchoolTasks?.[0]?.status || 'To Do').toLowerCase().replace(/\s+/g, '_') as TaskStatus,
        description: getDescriptionForTaskType(schoolTask.taskType, schoolDetails),
        schoolTaskId: schoolTask.id,
        userId: Number(internalUserId)
      }));
      setKanbanTasks(tasks);
    }
  }, [schoolDetails, internalUserId]);

  const handleTaskUpdate = async (taskId: string, newStatus: TaskStatus, position?: number) => {
    if (!internalUserId) {
      toast.error('User ID not found');
      return;
    }

    try {
      const normalizedStatus = newStatus.toLowerCase().replace(/\s+/g, '_') as TaskStatus;
      
      setKanbanTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: normalizedStatus }
            : task
        )
      );

      const response = await fetch(`${backendUrl}/api/schools/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          position: position || 0,
          userId: internalUserId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const updatedTask = await response.json();
      
      // Only refetch if needed (e.g., for header updates)
      await refetch();
      
      toast.success(`Task moved to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task status');
      
      // Revert local state on error
      if (schoolDetails?.schoolTasks) {
        const revertedTasks = schoolDetails.schoolTasks.map(schoolTask => ({
          id: schoolTask.id.toString(),
          title: schoolTask.taskType
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') + (schoolTask.isRequired ? ' *' : ' (Optional)'),
          status: (schoolTask.userSchoolTasks?.[0]?.status || 'To Do').toLowerCase().replace(/\s+/g, '_') as TaskStatus,
          description: getDescriptionForTaskType(schoolTask.taskType, schoolDetails),
          schoolTaskId: schoolTask.id,
          userId: Number(internalUserId)
        }));
        setKanbanTasks(revertedTasks);
      }
    }
  };
  
  

  
  
  
  


  useEffect(() => {
    if (error) {
      console.error('School fetch error:', error);
      toast.error(`School not found. Please check the school name.`);
    }
  }, [error]);

  const getDescriptionForTaskType = (taskType: string, schoolDetails: any): string => {
    switch (taskType) {
      case 'personal_statement': return schoolDetails.personal_statement || '';
      case 'diversity_statement': return schoolDetails.diversity_statement || '';
      case 'optional_statement': return schoolDetails.optional_statement_prompt || '';
      case 'letters_of_recommendation': return schoolDetails.letters_of_recommendation || '';
      case 'resume': return schoolDetails.resume || '';
      case 'extras_addenda': return schoolDetails.extras_addenda || '';
      case 'application_fee': return schoolDetails.application_fee || '';
      case 'interviews': return schoolDetails.interviews || '';
      default: return 'No additional details available';
    }
  };
  
  const handleRemoveSchool = async () => {
    if (!schoolDetails || !internalUserId) return;
    
    console.log('Attempting to remove school:', schoolDetails.school);
    console.log('School ID:', schoolDetails.id);
    console.log('User ID:', internalUserId);
    
    try {
      const response = await fetch(`${backendUrl}/api/schools/user/${internalUserId}/school/${schoolDetails.id}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      const responseData = await response.json();
      console.log('Delete response data:', responseData);

      if (!response.ok) {
        throw new Error('Failed to remove school');
      }

      toast.success(`${schoolDetails.school} has been removed from your schools`);
      router.push('/schools'); // Redirect to schools list after deletion
    } catch (error) {
      console.error('Error removing school:', error);
      toast.error('Failed to remove school');
    }
  };

  const renderContent = () => {
    if (!internalUserId || isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse">Loading...</div>
        </div>
      );
    }

    if (error || !schoolDetails) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="text-red-500 text-xl">School not found</div>
          <div className="text-gray-500">
            The school "{decodedName}" could not be found.
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4">
        <Toaster position="top-right" />
        <SchoolHeader 
          schoolDetails={schoolDetails} 
          onRemove={handleRemoveSchool}
          showRemoveButton={true}
        />
        <div className="mt-8">
          <KanbanBoard
            tasks={kanbanTasks}
            onTaskUpdate={handleTaskUpdate}
            internalUserId={internalUserId}
          />
        </div>
      </div>
    );
  };

  return renderContent();
};

export default SchoolPage;
