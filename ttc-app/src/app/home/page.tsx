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
  const firstName = authData?.user?.attributes?.given_name || authData?.user?.username || "there";
  
  
  // Fetch user details and tasks
  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      console.log("✅ Auth Data:", authData);

      try {
        // Ensure authData is populated
        if (!authData?.user?.attributes?.sub) {
          console.error("Missing userSub from authData");
          setIsLoading(false);
          return;
        }
        
        const userSub = authData.user.attributes.sub;
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"; 

        console.log(`Fetching user details for cognitoId: ${userSub}`);
        const response = await fetch(`${backendUrl}/api/users/resolve?cognitoSub=${userSub}`);
        
        if (!response.ok) {
          console.error(`Failed to fetch user details: ${response.statusText}`);
          setIsLoading(false);
          return;
        }

        const userDetails = await response.json();
        console.log("✅ Fetched user details:", userDetails);

        if (!userDetails || !userDetails.userId) {
          console.error("⚠️ userDetails is null or missing required fields");
          setIsLoading(false);
          return;
        }

        // Set track selection
        setSelectedTrack(userDetails.selectedTrack || null);

        // Fetch tasks for the user
        const tasksResponse = await fetch(
          `${backendUrl}/api/tasks/time-gated?userId=${userDetails.userId}&track=${userDetails.selectedTrack}`
        );
        
        if (!tasksResponse.ok) {
          console.error("Failed to fetch tasks:", tasksResponse.statusText);
          setIsLoading(false);
          return;
        }

        const tasksData = await tasksResponse.json();
        console.log("✅ Fetched tasks:", tasksData);
        setTasks(tasksData || []);

      } catch (error) {
        console.error("🔥 Error fetching user details or tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [authData]);

  // Prepare data for charts (Handle empty data cases)
  const priorityCount = tasks?.reduce(
    (acc: Record<string, number>, task: any) => {
      // Replace null or undefined priority with "Other"
      const priority = task.priority || "Other";
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    },
    {}
  );

  const taskDistribution = Object.keys(priorityCount || {}).map((key) => ({
    name: key === "null" ? "Other" : key, // Replace "null" with "Other" in display
    count: priorityCount[key],
  }));

  // Loading state
  if (isAuthLoading || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container h-full w-full bg-gray-100 bg-transparent p-8">
      <Header name="Project Management Dashboard" />
      <section className="relative h-auto text-white py-16 px-4 sm:px-6 lg:px-8 shadow-2xl rounded-xl overflow-hidden">
      {/* Background image layer */}
      <div className="absolute inset-0">
        <img 
          src="/ttc_hero.webp" 
          alt="Background" 
          className="w-full h-full object-cover opacity-50" 
        />
      </div>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-75"></div>
      
      {/* Content layer */}
      <div className="relative max-w-4xl mx-auto text-left">
        {/* Tutorial Video */}
        <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
          <video 
            controls
            className="w-full"
            poster="/ttc_hero.webp"
          >
            <source src="https://mp-s3-images.s3.us-east-1.amazonaws.com/How+to+use+Myplatt.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Hello {firstName},
        </h1>
        <p className="text-lg sm:text-xl font-bold mb-6">
          Welcome to MyPLATT! Here is a brief overview of how everything works. You keep access to this pricing as long as you do not leave MyPLATT. Also bear in mind that if you leave MyPLATT, you start all over from month 1. You cannot "pick up where you left off."
        </p>
        <div className="text-left max-w-3xl mx-auto">
          <ol className="list-decimal space-y-3 pl-5">
            <li className="text-base sm:text-lg">
              You can view your tasks by month under the "projects" section. You can view it as a list, board, timeline, or table. I prefer the board.
            </li>
            <li className="text-base sm:text-lg">
              Drag and drop tasks from the "To Do" section to the "In Progress," "Under Review," or "Completed" section. This will then update accordingly on your home page under "your tasks."
            </li>
            <li className="text-base sm:text-lg">
              You should be able to click all of the links within a task to see the resource.
            </li>
            <li className="text-base sm:text-lg">
              Each month, a new set of tasks will release for you to take action.
            </li>
          </ol>
        </div>
      </div>
    </section>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-8">
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 text-lg font-semibold">Task Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskDistribution.length ? taskDistribution : [{ name: "No Data", count: 0 }]}>
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
              rows={tasks.length ? tasks : []}
              columns={taskColumns}
              checkboxSelection
              loading={isLoading}
              getRowId={(row) => row.id || `task-${row.position}`}
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
