"use client";

import React, { useEffect, useState } from "react";
import ProjectHeader from "@/app/projects/ProjectHeader";
import Board from "../BoardView";
import List from "../ListView";
import Timeline from "../TimleineView";
import Table from "../TableView";
import ModalNewTask from "@/components/ModalNewTask";
import { useGetAuthUserQuery, useGetProjectsQuery } from "@/state/api";

type Props = {
  params: { id: string };
};

const Project = ({ params }: Props) => {
  const { id } = params;
  const [activeTab, setActiveTab] = useState("Board");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  
  // Fetching authData and projects at the Project level
  const { data: authData, isLoading: authLoading, error: authError } = useGetAuthUserQuery();
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useGetProjectsQuery();
  // State to hold the complete authData including userDetails
  const [completeAuthData, setCompleteAuthData] = useState<any>(null);

  useEffect(() => {
    if (authData && !authData.userDetails && authData.userSub) {
      const fetchUserDetails = async () => {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
          const response = await fetch(`${backendUrl}/users/${authData.userSub}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            // Include authentication headers if necessary
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user details");
          }

          const userDetails = await response.json();

          // Combine authData with userDetails
          setCompleteAuthData({
            ...authData,
            userDetails,
          });
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };

      fetchUserDetails();
    } else if (authData) {
      setCompleteAuthData(authData);
    }
  }, [authData]);


  useEffect(() => {
    // Debugging logs
    console.log("Fetched authData in Project:", authData);
    console.log("Fetched projects in Project:", projects);
  }, [authData, projects]);

  if (authLoading || projectsLoading) return <div>Loading...</div>;
  if (authError || projectsError) return <div>Error loading project data.</div>;

  return (
    <div>
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        id={id}
      />

      <ProjectHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "Board" && (
        <Board
          id={String(id)}
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          authData={completeAuthData} // Pass authData to BoardView
          projects={projects || []}
        />
      )}
      {activeTab === "List" && (
        <List id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Timeline" && (
        <Timeline id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Table" && (
        <Table id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
    </div>
  );
};

export default Project;
