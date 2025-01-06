"use client";

import React, { useState, useEffect } from "react";
import {
  useGetAuthUserQuery,
  useUpdateUserMutation,
} from "@/state/api";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Header from "@/components/Header";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dataGridClassName, dataGridSxStyles } from "@/lib/utils";

// Task columns for the DataGrid
const taskColumns: GridColDef[] = [
  { field: "title", headerName: "Title", width: 200 },
  { field: "status", headerName: "Status", width: 150 },
  { field: "priority", headerName: "Priority", width: 150 },
  { field: "dueDate", headerName: "Due Date", width: 150 },
];

// Home Page Component
const HomePage = () => {
  const { data: currentUser, isLoading: isAuthLoading } = useGetAuthUserQuery();
  const [updateUser] = useUpdateUserMutation();

  // State management
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch user's selected track and tasks based on time-gating
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!currentUser?.userSub) return;
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

        // Fetch user details
        const response = await fetch(
          `${backendUrl}/api/users/resolve?cognitoSub=${currentUser.userSub}`
        );

        if (!response.ok) {
          console.error("Failed to fetch user details.");
          return;
        }

        const userDetails = await response.json();
        console.log("Fetched User Details:", userDetails);

        // Set track and fetch time-gated tasks
        setSelectedTrack(userDetails.selectedTrack || null);

        if (userDetails.selectedTrack) {
          const taskResponse = await fetch(
            `${backendUrl}/tasks/time-gated?userId=${userDetails.userId}&track=${userDetails.selectedTrack}`
          );
          const taskData = await taskResponse.json();
          console.log("Fetched Tasks:", taskData);
          setTasks(taskData);
        }
      } catch (error) {
        console.error("Error fetching user details or tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [currentUser]);

  // Handle track selection
  const handleTrackSelection = async (track: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      const response = await fetch(`${backendUrl}/api/users/update-track`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSub: currentUser?.userSub,
          selectedTrack: track,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update track.");
      }

      setSelectedTrack(track);
      window.location.reload(); // Reload to fetch tasks after track selection
    } catch (error) {
      console.error("Error updating track:", error);
    }
  };

  // Show loading state
  if (isAuthLoading || isLoading) return <div>Loading..</div>;

  // Show track selection modal if no track is chosen
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

  // Analyze tasks for charts
  const priorityCount = tasks.reduce(
    (acc: Record<string, number>, task: any) => {
      const priority = task.priority || "Medium"; // Default to Medium
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    },
    {}
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  // Prepare task rows for DataGrid
  const taskRows = tasks.map((task) => ({
    id: task.id,
    title: task.title || "Untitled Task",
    status: task.status || "To Do",
    priority: task.priority || "Medium",
    dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A",
  }));

  return (
    <div className="container h-full w-[100%] bg-gray-100 bg-transparent p-8">
      <Header name="Project Management Dashboard" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 text-lg font-semibold">Task Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg bg-white p-4 shadow md:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">Your Tasks</h3>
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={taskRows}
              columns={taskColumns}
              checkboxSelection
              loading={isLoading}
              className={dataGridClassName}
              sx={dataGridSxStyles(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
