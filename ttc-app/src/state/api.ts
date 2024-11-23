// src/state/api.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { Auth } from 'aws-amplify'; // Ensure Amplify is configured


export interface Project {
    id: number; 
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    school: string;
}

export enum Priority{
    Urgent = "Urgent",
    High = "High",
    Medium = "Medium",
    Low = "Low",
    Backlog = "Backlog",
}

export enum Status {
    ToDo = "To Do",
    WorkInProgress = "Work In Progress",
    UnderReview = "Under Review",
    Completed = "Completed"
}

export  interface User {
    userId?: number;
    username: string;
    email: string;
    profilePictureUrl?: string;
    cognitoId?: string;
    teamId?: number;
}

export interface Attachment {
    id: number;
    fileURL: string;
    fileName: string;
    taskId: number;
    uploadById: number;
}
export interface Task {
    id: number; 
    title: string; 
    description?: string; 
    status?: Status; 
    priority?: Priority; 
    tags?: string; 
    startDate?: string; 
    dueDate?: string; 
    points?: number; 
    projectId: number; 
    authorUserId?: number; 
    assignedUserId?: number;
    
    author?: User;
    assignee?: User;
    comments?: Comment[];
    attachments?: Attachment[];
}

export interface Team {
    teamId: number;
    teamName: string;
    productOwnerUserId?: number;
    projectManagerUserId?: number;
}
export interface SearchReults {
    tasks?: Task[];
    projects?: Project[];
    users?: User[];
}

export interface Project {
    id: number; 
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    school: string;
}

export interface User {
    userId?: number;
    username: string;
    email: string;
    profilePictureUrl?: string;
    cognitoId?: string;
    teamId?: number;
    subscriptionStatus?: string;
    firstName?: string; // Added
    lastName?: string;  // Added
}
export const api = createApi({
    baseQuery: fetchBaseQuery({ 
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        prepareHeaders: async (headers) => {
            try {
              const session = await Auth.currentSession();
              const accessToken = session.getAccessToken().getJwtToken();
              if (accessToken) {
                headers.set("Authorization", `Bearer ${accessToken}`);
              }
            } catch (error) {
              console.error("Error fetching session:", error);
              // Optionally handle the error, e.g., redirect to login
            }
            return headers;
          }
        
    }),
    reducerPath: 'api',
    tagTypes: [ "Projects", "Tasks", "Users", "Teams", "Payment"],
    endpoints: (build) => ({

        getAuthUser: build.query<{
            user: { username: string; attributes: Record<string, string> };
            userSub: string;
            userDetails: User;
          }, void>({
            queryFn: async (_, _queryApi, _extraOptions, fetchWithBQ) => {
              try {
                const cognitoUser = await Auth.currentAuthenticatedUser();
                if (!cognitoUser) throw new Error("No user found");
          
                const user = {
                  username: cognitoUser.getUsername(),
                  attributes: cognitoUser.attributes || {},
                };
          
                const userSub = user.attributes.sub;
                const userDetailsResponse = await fetchWithBQ(`users/${userSub}`);
                if (userDetailsResponse.error) {
                  const errorMessage = (userDetailsResponse.error.data as { message?: string })?.message || "Failed to fetch user details";
                  throw new Error(errorMessage);
                }
                const userDetails = userDetailsResponse.data as User;
          
                return { data: { user, userSub, userDetails } };
              } catch (error: any) {
                return { error: error?.message || "Could not fetch user data" };
              }
            },
          }),
          
        
        getProjects: build.query<Project[], void>({
            query: () => "projects",
            providesTags: ["Projects"],
        }),
        createProject: build.mutation<Project, Partial<Project>>({
            query: (project) => ({
                url: "projects",
                method: "POST",
                body: project,
            }),
            invalidatesTags: ["Projects"]
        }),
        getTasks: build.query<Task[], { projectId: number }>({
            query: ({ projectId }) => `tasks?projectId=${projectId}`,
            providesTags: (result) => 
                result 
                    ? result.map(({ id }) => ({ type: "Tasks" as const, id })) 
                    : [{ type: "Tasks" as const }],
        }),
        getTasksByUser: build.query<Task[], number>({
            query: (userId ) => `tasks/user/${userId}`,
            providesTags: (result, error, userId) =>
                result
                    ? result.map(({ id }) =>({ type: "Tasks", id}))
                    :[{ type: "Tasks", id: userId }],
        }),
        createTask: build.mutation<Task, Partial<Task>>({
            query: (task) => ({
                url: "tasks",
                method: "POST",
                body: task,
            }),
            invalidatesTags: ["Tasks"],
        }), 
        updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
            query: ({ taskId, status }) => ({
                url: `tasks/${taskId}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: (result, error, {taskId}) => [
                { type: "Tasks", id: taskId },
            ],
        }),
        getUsers: build.query<User[], void>({
            query: () => "users",
            providesTags: ["Users"]
        }),
        getTeams: build.query<Team[], void>({
            query: () => "teams",
            providesTags: ["Teams"]
        }),
        search: build.query<SearchReults, string>({
            query: (query) => `search?query=${query}`,
        }),
        logPayment: build.mutation<void, { sessionId: string; email: string }>({
            query: (data) => ({
                url: "payment/success",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Payment"]
        }),
        updateUserStatus: build.mutation<{ message: string; user: User }, { cognitoId: string; status: string }>({
            query: (data) => ({
            url: "/api/users/update-user-status",
            method: "POST",
            body: data,
            }),
            invalidatesTags: ["Users"],
        }),
        createFreshUser: build.mutation<User, Partial<User>>({
            query: (user) => ({
                url: "/api/users/create-user",
                method: "POST",
                body: user,
            }),
            invalidatesTags: ["Users"],
        }),
        createUser: build.mutation<void, {
            cognitoId: string;
            username: string;
            email: string;
            firstName: string;
            lastName: string;
            profilePictureUrl: string;
            teamId?: number;
            subscriptionStatus: string;
          }>({
            query: (data) => ({
              url: "/create-user",
              method: "POST",
              body: data,
            }),
            invalidatesTags: ["Users"], // Optional
          }),                
        updateAfterPayment: build.mutation<
                { success: boolean; user: User }, 
                { sessionId: string; firstName: string; lastName: string; username: string; profilePictureUrl: string }
            >({
            query: (data) => ({
                url: 'users/update-after-payment',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ["Users"],
            }),
            

    }),
});



export const { 
    useGetProjectsQuery, 
    useCreateProjectMutation, 
    useGetTasksQuery, 
    useCreateTaskMutation, 
    useUpdateTaskStatusMutation, 
    useSearchQuery, 
    useGetUsersQuery, 
    useGetTeamsQuery,
    useGetTasksByUserQuery,
    useGetAuthUserQuery,
    useLogPaymentMutation,
    useUpdateUserStatusMutation,
    useCreateFreshUserMutation,
    useCreateUserMutation,
    useUpdateAfterPaymentMutation,
} = api;