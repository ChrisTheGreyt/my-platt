"use client";

import React, { useState, useEffect } from "react";
import { useGetAuthUserQuery } from "@/state/api";
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

const taskColumns: GridColDef[] = [
  { field: "title", headerName: "Title", width: 200 },
  { field: "status", headerName: "Status", width: 150 },
  { field: "priority", headerName: "Priority", width: 150 },
  { field: "dueDate", headerName: "Due Date", width: 150 },
];

const HomePage = () => {
  // 1. Get auth data from RTK Query
  const { data: authData, isLoading: isAuthLoading } = useGetAuthUserQuery();

  // 2. State
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 3. Fetch user details + tasks once authData is loaded
  useEffect(() => {
    if (!authData) return;
  
    const fetchUserDetails = async () => {
      setIsLoading(true);
  
      try {
        const userSub = authData?.user?.attributes?.sub;
        if (!userSub) {
          console.error("Missing userSub");
          setIsLoading(false);
          return;
        }
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(
          `${backendUrl}/users/resolve?cognitoId=${userSub}`
        );
  
        if (!response.ok) {
          // Could be 404, 403, etc.
          const errorData = await response.json();
          console.error("Failed to fetch user details:", errorData);
          setIsLoading(false);
          // Maybe show an error message or handle auto-creation logic
          return;
        }
  
        // If it's 2xx, parse the user object
        const userDetails = await response.json();
        console.log("Fetched user details:", userDetails);
  
        // Then proceed with your logic
        const track = userDetails.selectedTrack || null;
        if (!track) {
          setSelectedTrack(null);
        } else {
          setSelectedTrack(track);
        }
  
        // etc...
      } catch (error) {
        console.error("Error fetching user details or tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserDetails();
  }, [authData]);
  
  

  // 4. Handle track selection (called when user clicks a timeline button)
  const handleTrackSelection = async (track: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      // Double-check userSub path
      const userSub = authData?.user?.attributes?.sub;

      if (!userSub) {
        console.error("User sub not found while updating track");
        return;
      }

      console.log("Updating track:", { userSub, selectedTrack: track });

      const response = await fetch(`${backendUrl}/users/update-track`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userSub, selectedTrack: track }),
      });

      if (!response.ok) {
        throw new Error("Failed to update track.");
      }

      // Now set local state & localStorage
      setSelectedTrack(track);
      localStorage.setItem("selectedTrack", track);

      // Re-fetch tasks
      const taskResponse = await fetch(
        `${backendUrl}/tasks/time-gated?userId=${userSub}&track=${track}`
      );
      const taskData = await taskResponse.json();
      setTasks(Array.isArray(taskData) ? taskData : []);
    } catch (error) {
      console.error("Error updating track:", error);
    }
  };

  // 5. Prepare the bar chart data
  const priorityCount = tasks.reduce(
    (acc: Record<string, number>, task: any) => {
      const { priority } = task;
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    },
    {}
  );

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  // 6. Render logic
  if (isAuthLoading || isLoading) {
    return <div>Loading..</div>;
  }

  if (!selectedTrack) {
    // Show track selection
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="w-96 rounded-lg bg-white p-6 text-center shadow-lg">
          <h2 className="mb-4 text-2xl font-bold">Select Your Track</h2>
          <p className="mb-6">Choose your application timeline:</p>
          <button
            className="mb-4 block w-full rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-700"
            onClick={() => handleTrackSelection("2025")}
          >
            Fall 2025 Application Timeline
          </button>
          <button
            className="block w-full rounded bg-green-500 py-2 px-4 text-white hover:bg-green-700"
            onClick={() => handleTrackSelection("2026")}
          >
            Fall 2026 Application Timeline
          </button>
        </div>
      </div>
    );
  }

  // Show the main dashboard if a track is selected
  return (
    <div className="container h-full w-full bg-gray-100 bg-transparent p-8">
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
        <div className="md:col-span-2 rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 text-lg font-semibold">Your Tasks</h3>
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={tasks}
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
