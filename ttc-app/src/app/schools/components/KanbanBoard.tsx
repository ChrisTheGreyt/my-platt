'use client';

import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { debounce } from 'lodash';
import { AnimatePresence, motion } from 'framer-motion';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  description?: string;
  priority?: string;
}

export interface KanbanBoardProps {
  // mergedTasks is passed in from the parent which merges DB tasks with defaults
  tasks: Task[];
  onTaskUpdate?: (taskId: string, newStatus: TaskStatus, position?: number) => Promise<void>;
  // internalUserId may be used by update logic if needed
  internalUserId: string | null;
}

interface DraggableTaskProps {
  task: Task;
  column: Column; 
  isDraggedOver?: boolean;
  dragOverPosition?: 'top' | 'bottom';
  onMoveTask?: (taskId: string, newStatus: TaskStatus) => void;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  accentColor: string;
  tasks: Task[];
}

const DroppableColumn: React.FC<{ column: Column; children: React.ReactNode }> = ({ column, children }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <h3 className="font-medium text-gray-800">{column.title}</h3>
        <div className="text-sm text-gray-500">{column.tasks.length} tasks</div>
      </div>
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-4 rounded-lg bg-gradient-to-b ${column.color}
          min-h-[200px] transition-colors duration-200
          ${column.tasks.length === 0 ? 'flex items-center justify-center' : ''}
        `}
      >
        {column.tasks.length === 0 ? (
          <p className="text-sm text-gray-400">Drop tasks here</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

const DraggableTask: React.FC<DraggableTaskProps> = ({ task, column, isDraggedOver, dragOverPosition, onMoveTask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleMoveClick = (e: React.MouseEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMoveTask && task.status !== newStatus) {
      onMoveTask(task.id, newStatus);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`relative bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-2 cursor-grab active:cursor-grabbing`}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2 h-2 rounded-full bg-${column.accentColor}-400`} />
          <span className="text-sm font-medium text-gray-600">{column.title}</span>
        </div>
        <h4 className="font-medium text-gray-800 text-base">{task.title}</h4>
      </div>
      <div className="mt-3 relative space-y-2">
        <div className={`transition-all duration-300 ease-in-out relative ${isExpanded ? 'max-h-none' : 'max-h-[4.5rem] overflow-hidden'}`}>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
          {!isExpanded && task.description && task.description.length > 150 && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>
        {task.description && task.description.length > 150 && (
          <div className="flex justify-start">
            <button
              onClick={toggleExpand}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none hover:underline flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Show More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
        {/* Left movement buttons */}
        <div>
          {column.id === 'in_progress' && (
            <button onClick={(e) => handleMoveClick(e, 'todo')}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              To Do
            </button>
          )}
          {column.id === 'review' && (
            <button onClick={(e) => handleMoveClick(e, 'in_progress')}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              In Progress
            </button>
          )}
          {column.id === 'completed' && (
            <button onClick={(e) => handleMoveClick(e, 'review')}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Review
            </button>
          )}
        </div>
        {/* Right movement buttons */}
        <div>
          {column.id === 'todo' && (
            <button onClick={(e) => handleMoveClick(e, 'in_progress')}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded">
              In Progress
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {column.id === 'in_progress' && (
            <button onClick={(e) => handleMoveClick(e, 'review')}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded">
              Review
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {column.id === 'review' && (
            <button onClick={(e) => handleMoveClick(e, 'completed')}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded">
              Complete
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface UserSchoolTask {
    id: number;
    userId: number;
    schoolTaskId: number;
    status: string;
    priority: string;
    position: number;
    schoolTask: {
        id: number;
        taskType: string;
        isRequired: boolean;
    };
}

const transformUserSchoolTaskToTask = (userSchoolTask: UserSchoolTask): Task => {
    // Convert any 'to do' or 'to_do' status to 'todo'
    let status = userSchoolTask.status.toLowerCase().replace(/\s/g, '_');
    if (status === 'to_do') status = 'todo';
    
    return {
        id: userSchoolTask.id.toString(),
        title: userSchoolTask.schoolTask.taskType,
        status: status as TaskStatus,
        description: `Required: ${userSchoolTask.schoolTask.isRequired}`,
        priority: userSchoolTask.priority
    };
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks: initialTasks, onTaskUpdate, internalUserId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dragOverInfo, setDragOverInfo] = useState<{ taskId: string; position: 'top' | 'bottom' } | null>(null);

  // Update tasks whenever initialTasks changes
  useEffect(() => {
    if (initialTasks?.length > 0) {
      setTasks(initialTasks);
    }
  }, [initialTasks]);

  // Add debug logging
  useEffect(() => {
    console.log('KanbanBoard Props:', {
      initialTasks,
      internalUserId
    });
  }, [initialTasks, internalUserId]);

  // Update the tasks processing useEffect
  useEffect(() => {
    console.log('Processing tasks:', initialTasks);
    
    if (!initialTasks) {
        console.log('No tasks provided');
        setTasks([]);
        return;
    }

    try {
        const formattedTasks = initialTasks.map(task => {
            console.log('Processing individual task:', task);
            
            // Ensure status is in the correct format for the columns
            const status = (task.status || 'todo')
                .toLowerCase()
                .replace(/\s/g, '_')
                .replace('to_do', 'todo') as TaskStatus;

            return {
                ...task,
                id: task.id.toString(),
                status: status
            };
        });

        console.log('Formatted tasks:', formattedTasks);
        setTasks(formattedTasks);
    } catch (error) {
        console.error('Error processing tasks:', error);
        setTasks([]);
    }
  }, [initialTasks]);

  // Helper to get proper status display text (if needed)
  const getStatusFromColumnId = (columnId: string): string => {
    switch (columnId) {
      case 'todo': return 'To Do';
      case 'in_progress': return 'In Progress';
      case 'review': return 'Under Review';
      case 'completed': return 'Completed';
      default: return 'To Do';
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const columns: Column[] = [
    {
      id: 'todo',
      title: 'To Do',
      color: 'from-slate-50 to-white',
      accentColor: 'slate',
      tasks: tasks.filter(task => task.status === 'todo'),
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      color: 'from-indigo-50 to-white',
      accentColor: 'indigo',
      tasks: tasks.filter(task => task.status === 'in_progress'),
    },
    {
      id: 'review',
      title: 'Under Review',
      color: 'from-amber-50 to-white',
      accentColor: 'amber',
      tasks: tasks.filter(task => task.status === 'review'),
    },
    {
      id: 'completed',
      title: 'Completed',
      color: 'from-emerald-50 to-white',
      accentColor: 'emerald',
      tasks: tasks.filter(task => task.status === 'completed'),
    },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setDragOverInfo(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Check if we're dragging over a column
    const isOverColumn = columns.some(col => col.id === over.id);
    
    if (isOverColumn) {
      // We're over a column, clear any task-specific drop indicators
      setDragOverInfo(null);
      return;
    }

    // Handle task-specific drop indicators as before
    const activeTask = tasks.find(task => task.id === active.id);
    const overTask = tasks.find(task => task.id === over.id);
    if (!activeTask || !overTask) return;

    const mouseY = (event as any).activatorEvent?.clientY ?? 0;
    const overRect = over.rect;
    const overTaskMiddleY = overRect.top + overRect.height / 2;

    setDragOverInfo({
      taskId: overTask.id,
      position: mouseY < overTaskMiddleY ? 'top' : 'bottom'
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || isUpdating) return;

    const activeTask = tasks.find(task => task.id === active.id);
    
    // Get the target column - either directly or from the task we're dropping onto
    const targetColumnId = columns.some(col => col.id === over.id)
      ? over.id as string
      : tasks.find(task => task.id === over.id)?.status || activeTask?.status;

    if (!activeTask || !targetColumnId) return;

    const newStatus = targetColumnId as TaskStatus;
    
    // Don't update if status hasn't changed
    if (activeTask.status === newStatus) {
      setActiveId(null);
      setDragOverInfo(null);
      return;
    }

    setIsUpdating(true);

    try {
      // Update local state first
      const updatedTasks = tasks.map(task =>
        task.id === active.id ? { ...task, status: newStatus } : task
      );
      setTasks(updatedTasks);

      // Then update server
      if (onTaskUpdate) {
        await onTaskUpdate(active.id.toString(), newStatus, 0);
        toast.success(`Task moved to ${getStatusFromColumnId(newStatus)}`);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task status');
      
      // Revert on error
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === active.id ? { ...task, status: activeTask.status } : task
        )
      );
    } finally {
      setIsUpdating(false);
      setActiveId(null);
      setDragOverInfo(null);
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    if (isUpdating) return;
    setIsUpdating(true);
    const loadingToast = toast.loading('Updating task status...');
    try {
      // Calculate new position based on tasks in target column
      const columnTasks = tasks.filter(task => task.status === newStatus);
      const newPosition = columnTasks.length;
      if (onTaskUpdate) {
        await onTaskUpdate(taskId, newStatus, newPosition);
      }
      setTasks(prevTasks =>
        prevTasks.map(task => (task.id === taskId ? { ...task, status: newStatus } : task))
      );
      const columnTitle = columns.find(col => col.id === newStatus)?.title;
      toast.success(`Task moved to ${columnTitle}`, { id: loadingToast });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status', { id: loadingToast });
    } finally {
      setIsUpdating(false);
    }
  };

  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;
  const activeColumn = activeTask ? columns.find(col => col.tasks.some(task => task.id === activeTask.id)) : null;

  const handleTaskUpdate = async (taskId: string, newStatus: string, position: number) => {
    if (!internalUserId) return;

    try {
      console.log(`Updating task ${taskId} to status ${newStatus} at position ${position}`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-tasks/tasks/${taskId}/status-position`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          position,
          userId: internalUserId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      console.log('Task updated successfully:', updatedTask);
      
      // Optionally refetch tasks to ensure UI is in sync
      refetch();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task status');
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="w-full overflow-x-auto bg-gray-50/50 rounded-xl p-8">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800">Requirements Progress</h2>
          <p className="text-gray-600 mt-1">Track your application requirements and their current status</p>
        </div>
        <DndContext 
          sensors={sensors} 
          onDragStart={handleDragStart} 
          onDragOver={handleDragOver} 
          onDragEnd={handleDragEnd}
        >
          <div className="min-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map(column => (
              <DroppableColumn key={column.id} column={column}>
                <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                  <AnimatePresence>
                    {column.tasks.map(task => (
                      <DraggableTask
                        key={task.id}
                        task={task}
                        column={column}
                        isDraggedOver={dragOverInfo?.taskId === task.id}
                        dragOverPosition={dragOverInfo?.taskId === task.id ? dragOverInfo.position : undefined}
                        onMoveTask={handleMoveTask}
                      />
                    ))}
                  </AnimatePresence>
                </SortableContext>
              </DroppableColumn>
            ))}
          </div>
          <DragOverlay dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
            {activeTask && activeColumn && (
              <DraggableTask task={activeTask} column={activeColumn} />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  );
};

export default KanbanBoard;
