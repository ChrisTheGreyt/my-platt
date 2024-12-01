"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/app/redux";
import "gantt-task-react/dist/index.css";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import Header from "@/components/Header";
import { Auth } from "aws-amplify";

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [userSub, setUserSub] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-us",
  });

  // Step 1: Fetch userSub (Cognito ID)
  useEffect(() => {
    const fetchUserSub = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const cognitoId = user.attributes.sub; // Cognito userSub
        setUserSub(cognitoId);
      } catch (error) {
        console.error("Failed to fetch userSub:", error);
        setIsLoading(false); // Stop loading if userSub fetch fails
      }
    };

    fetchUserSub();
  }, []);

  // Step 2: Resolve userId using userSub
  useEffect(() => {
    const fetchUserId = async () => {
      if (!userSub) return;

      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(
          `${backendUrl}/api/users/resolve?cognitoSub=${userSub}`
        );

        if (!response.ok) {
          console.error("Failed to fetch userId:", response.statusText);
          setIsLoading(false); // Stop loading if userId fetch fails
          return;
        }

        const data = await response.json();
        setUserId(data.userId);
      } catch (error) {
        console.error("Error fetching userId:", error);
        setIsLoading(false); // Stop loading if userId fetch fails
      }
    };

    fetchUserId();
  }, [userSub]);

  // Step 3: Fetch projects using userId
  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId) return;

      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(
          `${backendUrl}/api/users/${userId}/projects`
        );

        if (!response.ok) {
          console.error("Failed to fetch projects:", response.statusText);
          setIsLoading(false); // Stop loading if projects fetch fails
          return;
        }

        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);

  // Prepare tasks for the Gantt chart
  const ganttTasks = useMemo(() => {
    return projects.map((project) => ({
      start: new Date(project.startDate || Date.now()),
      end: new Date(
        project.endDate ||
          Date.now() + 7 * 24 * 60 * 60 * 1000
      ), // Default 1-week range
      name: project.name || "Unnamed Project",
      id: `Project-${project.id}`,
      type: "project" as TaskTypeItems,
      progress: project.progress || 0,
      isDisabled: false,
    }));
  }, [projects]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (!projects.length)
    return <div>No projects available for your selected track.</div>;

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
            columnWidth={
              displayOptions.viewMode === ViewMode.Month ? 150 : 100
            }
            listCellWidth="100px"
            projectBackgroundColor={isDarkMode ? "#101214" : "#1f2937"}
            projectProgressColor={isDarkMode ? "#1f2937" : "#aeb8c2"}
            projectProgressSelectedColor={isDarkMode ? "#000" : "#9ba1a6"}
          />
        </div>
      </div>
    </div>
  );
};

export default Timeline;
