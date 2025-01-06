"use client";

import React, { useState, useEffect } from "react";
import {
  Priority,
  Project,
  Task,
  useGetProjectsQuery,
  useGetTasksQuery,
  useGetAuthUserQuery,
  useUpdateUserMutation,
} from "@/state/api";
import { useAppSelector } from "@/state/hooks";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Header from "@/components/Header";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dataGridClassName, dataGridSxStyles } from "@/lib/utils";

const taskColumns: GridColDef[] = [
  { field: "title", headerName: "Title", width: 200 },
  { field: "status", headerName: "Status", width: 150 },
  { field: "priority", headerName: "Priority", width: 150 },
  { field: "dueDate", headerName: "Due Date", width: 150 },
];


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const HomePage = () => {
  const { data: currentUser, isLoading: isAuthLoading } = useGetAuthUserQuery();
  const [updateUser] = useUpdateUserMutation();
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [completeUserData, setCompleteUserData] = useState<any>(null); // Add state here

  // Fetch the selectedTrack from the user data
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(
          `${backendUrl}/api/users/resolve?cognitoSub=${currentUser?.userSub}`
        );

        if (!response.ok) {
          console.error("Failed to fetch user details.");
          return;
        }

        const userDetails = await response.json();
        console.log("Fetched User Details:", userDetails);

        // Combine userDetails with currentUser
        setCompleteUserData({
          ...currentUser,
          userDetails,
        });

        // Update selectedTrack if available
        if (userDetails?.selectedTrack) {
          setSelectedTrack(userDetails.selectedTrack);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    if (currentUser?.userSub) {
      fetchUserDetails();
    }
  }, [currentUser]);

  const handleTrackSelection = async (track: string) => {
    try {
      if (!completeUserData?.userDetails?.userId) {
        console.error("User ID is missing.");
        return;
      }

      await updateUser({
        userId: completeUserData.userDetails.userId, // Use completeUserData here
        selectedTrack: track,
      });

      setSelectedTrack(track); // Update local state
    } catch (error) {
      console.error("Error updating user track:", error);
    }
  };

  const {
    data: tasks,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useGetTasksQuery({ projectId: parseInt("1") });
  const { data: projects, isLoading: isProjectsLoading } =
    useGetProjectsQuery();

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isAuthLoading || tasksLoading || isProjectsLoading)
    return <div>Loading..</div>;
  if (tasksError || !tasks || !projects)
    return <div>Error fetching data</div>;


  if (!selectedTrack) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="w-96 p-6 bg-white shadow-lg rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Select Your Track</h2>
          <p className="mb-6">Choose your application timeline:</p>
          <button
            className="block w-full bg-blue-500 text-white py-2 px-4 rounded mb-4 hover:bg-blue-700"
            onClick={() => handleTrackSelection("2025")}
          >
            Fall 2025 Application Timeline
          </button>
          <button
            className="block w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
            onClick={() => handleTrackSelection("2026")}
          >
            Fall 2026 Application Timeline
          </button>
        </div>
      </div>
    );
  }
  

  const priorityCount = tasks.reduce(
    (acc: Record<string, number>, task: Task) => {
      const { priority } = task;
      acc[priority as Priority] = (acc[priority as Priority] || 0) + 1;
      return acc;
    },
    {}
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  const statusCount = projects.reduce(
    (acc: Record<string, number>, project: Project) => {
      const status = project.endDate ? "Completed" : "Active";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  const chartColors = isDarkMode
    ? {
        bar: "#8884d8",
        barGrid: "#303030",
        pieFill: "#4A90E2",
        text: "#FFFFFF",
      }
    : {
        bar: "#8884d8",
        barGrid: "#E0E0E0",
        pieFill: "#82ca9d",
        text: "#000000",
      };

  return (
    <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
      <Header name="Project Management Dashboard" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">
            Task Priority Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskDistribution}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={chartColors.barGrid}
              />
              <XAxis dataKey="name" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip
                contentStyle={{
                  width: "min-content",
                  height: "min-content",
                }}
              />
              <Legend />
              <Bar dataKey="count" fill={chartColors.bar} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">
            Project Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie dataKey="count" data={projectStatus} fill="#82ca9d" label>
                {projectStatus.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary md:col-span-2">
          <h3 className="mb-4 text-lg font-semibold dark:text-white">
            Your Tasks
          </h3>
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={tasks}
              columns={taskColumns}
              checkboxSelection
              loading={tasksLoading}
              getRowClassName={() => "data-grid-row"}
              getCellClassName={() => "data-grid-cell"}
              className={dataGridClassName}
              sx={dataGridSxStyles(isDarkMode)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
