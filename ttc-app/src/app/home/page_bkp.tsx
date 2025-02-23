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
  // Get auth data from RTK Query
  const { data: authData, isLoading: isAuthLoading } = useGetAuthUserQuery();

  // State
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch user details and tasks
  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const userSub = authData?.user?.attributes?.sub;
        console.log("User Cognito Sub:", userSub);
    
        if (!userSub) {
          console.error("Missing CognitoSub");
          setIsLoading(false);
          return;
        }
    
        // ✅ First resolve userId from cognitoId
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const userResponse = await fetch(`${backendUrl}/api/users/resolve?cognitoSub=${userSub}`);
        const userData = await userResponse.json();
        
        if (!userData.userId) {
          console.error("Could not resolve userId from CognitoId");
          setIsLoading(false);
          return;
        }
    
        console.log("Resolved userId:", userData.userId);
        setSelectedTrack(userData.selectedTrack);
    
        // ✅ Use resolved `userId` in the `/tasks/time-gated` request
        const taskResponse = await fetch(
          `${backendUrl}/tasks/time-gated?userId=${userData.userId}&track=${userData.selectedTrack}`
        );
        const taskData = await taskResponse.json();
        console.log("Fetched tasks:", taskData);
    
        setTasks(
          Array.isArray(taskData)
            ? taskData.map((task: any) => ({
                id: task.id,
                title: task.title || "Untitled Task",
                status: task.status || "Not Started",
                priority: task.priority || "Low",
                dueDate: task.dueDate || "No Due Date",
              }))
            : []
        );
      } catch (error) {
        console.error("Error fetching user details or tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    

    // Trigger fetch
    fetchUserDetails();
  }, [authData]);

  // Prepare data for charts
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

  // Loading state
  if (isAuthLoading || isLoading) {
    return <div>Loading...</div>;
  }

  // Render the main dashboard
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
