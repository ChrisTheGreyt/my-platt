// Timeline.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useGetTasksQuery, useGetAuthUserQuery } from '@/state/api';
import { useAppSelector, useAppDispatch } from '@/state/hooks';
import { setUser } from '@/state/authSlice';
import "gantt-task-react/dist/index.css";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import Header from "@/components/Header";

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = ({ id, setIsModalNewTaskOpen }: Props) => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Fetch authenticated user data, which should include userDetails with userId
  const { data: currentUserData, error: userError, isLoading: userLoading } = useGetAuthUserQuery();

  // Dispatch setUser to store userDetails in Redux
  useEffect(() => {
    if (currentUserData) {
      dispatch(setUser(currentUserData));
    }
  }, [currentUserData, dispatch]);

  // Access userId and determine if user is an admin
  const userId = useAppSelector((state) => state.auth.userDetails?.userId ?? null);
  const isAdmin = userId !== null && [109].includes(userId);

  console.log("Resolved userId:", userId);
  console.log("isAdmin:", isAdmin);

  // Fetch tasks for the specified project
  const { data: tasks, error: tasksError, isLoading: tasksLoading } = useGetTasksQuery({ projectId: Number(id) });

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-us",
  });

  const ganttTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.map((task) => ({
      start: new Date(task.startDate as string),
      end: new Date(task.dueDate as string),
      name: task.title,
      id: `Task-${task.id}`,
      type: "task" as TaskTypeItems,
      progress: task.points ? (task.points / 10) * 100 : 0,
      isDisabled: false,
    }));
  }, [tasks]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (userLoading || tasksLoading) return <div>Loading...</div>;
  if (userError) return <div>An error occurred while fetching user data</div>;
  if (tasksError) return <div>An error occurred while fetching tasks</div>;
  if (!tasks?.length) return <div>No tasks available for your selected track.</div>;

  return (
    <div className="max-w-full p-8">
      <header className="mb-4 flex items-center justify-between">
        <Header name="Projects Timeline" />
        <div className="relative inline-block w-64">
          <select
            className="focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
            value={displayOptions.viewMode}
            onChange={handleViewModeChange}
          >
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
          </select>
        </div>
      </header>

      <div className="overflow-x-scroll rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white">
        <div className="timeline">
          <Gantt
            tasks={ganttTasks}
            {...displayOptions}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth="100px"
            barBackgroundColor={isDarkMode ? "#101214" : "#aeb8c2"}
            barBackgroundSelectedColor={isDarkMode ? "#000" : "#9ba1a6"}
          />
        </div>
        <div className="px-4 pb-5 pt-1">
          {isAdmin && (
            <button
              className="flex item-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600 opacity-1"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              Add Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
