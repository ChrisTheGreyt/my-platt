"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useAppSelector } from "@/app/redux";
import "gantt-task-react/dist/index.css";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import Header from "@/components/Header";
import { Auth } from "aws-amplify";

type TaskTypeItems = "task" | "milestone" | "project";

const Timeline = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-us",
  });

  // Fetch the user's selected track and userId
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const cognitoSub = user.attributes.sub;

        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/users/resolve?cognitoSub=${cognitoSub}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }
        const userDetails = await response.json();
        console.log("Fetched user details:", userDetails);
        setSelectedTrack(userDetails.selectedTrack || null);
        setUserId(userDetails.userId);

        // Fetch projects for the user
        const projectsResponse = await fetch(`${backendUrl}/api/users/${userDetails.userId}/projects`);
        if (!projectsResponse.ok) {
          throw new Error("Failed to fetch projects");
        }
        const projectsData = await projectsResponse.json();
        console.log("Fetched projects:", projectsData);
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  // Filter projects based on the selected track
const filteredProjects = useMemo(() => {
  if (!projects || !selectedTrack) return [];
  
  // Adjust this condition to match your backend schema
  const filtered = projects.filter((project) => project.selectedTrack === selectedTrack);
  
  console.log("Filtered Projects:", filtered);
  return filtered;
}, [projects, selectedTrack]);


  const safeDate = (date: string | undefined): Date => {
    const parsedDate = date ? new Date(date) : new Date();
    if (isNaN(parsedDate.getTime())) {
      console.warn("Invalid date:", date);
      return new Date(); // Fallback to current date
    }
    return parsedDate;
  };

  const ganttTasks = useMemo(() => {
    return (
      filteredProjects.map((project) => ({
        start: safeDate(project.startDate),
        end: safeDate(project.endDate),
        name: project.name || "Unnamed Project",
        id: `Project-${project.id}`,
        type: "project" as TaskTypeItems,
        progress: 50,
        isDisabled: false,
      })) || []
    );
  }, [filteredProjects]);

  const handleViewModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (!filteredProjects.length) return <div>No projects available for your selected track.</div>;

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
