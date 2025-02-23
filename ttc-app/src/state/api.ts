import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Auth } from 'aws-amplify';
import { useEffect } from 'react';

export interface Project {
    id: number; 
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    school: string;
}

export enum Priority {
    Urgent = "Urgent",
    High = "High",
    Medium = "Medium",
    Low = "Low",
    Backlog = "Backlog",
}

export enum Status {
    ToDo = "TO_DO",
    WorkInProgress = "WORK_IN_PROGRESS",
    UnderReview = "UNDER_REVIEW",
    Completed = "COMPLETED"
}

export interface User {
    userId?: number;
    username: string;
    email: string;
    profilePictureUrl?: string;
    cognitoId?: string;
    teamId?: number;
    subscriptionStatus?: string;
    firstName?: string;
    lastName?: string;
    selectedTrack?: string;
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

export interface UserTasks {
    id: number;
    userId: number;
    taskId: number;
    schoolTaskId?: number;
    status: string;
    priority: string;
    position: number;
    user?: User;
    task?: Task;
    schoolTask?: SchoolTask;
}

export interface AuthData {
    user: { username: string; attributes: Record<string, string> };
    userSub: string;
    userDetails: ResolveUserResponse;
}

export interface ResolveUserResponse {
    userId: number;
    selectedTrack?: string;
    subscriptionStatus?: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePictureUrl: string;
    cognitoId: string;
    teamId: number;
}

export interface SchoolTask {
    id: number;
    taskType: string;
    isRequired: boolean;
    userSchoolTasks: {
        status: string;
        position: number;
    }[];
}

export interface UserSchool {
    id: number;
    userId: number;
    school: string;
    isSelected: boolean;
    completionPercentage: number;
    tasksCompleted: number;
    totalTasks: number;
}

export interface School {
    id: number;
    school: string;
    personal_statement?: string;
    diversity_statement?: string;
    optional_statement_prompt?: string;
    letters_of_recommendation?: string;
    resume?: string;
    extras_addenda?: string;
    application_fee?: string;
    interviews?: string;
    note?: string;
    schoolTasks: SchoolTask[];
}

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        prepareHeaders: async (headers, { endpoint }) => {
            // Skip authentication for public endpoints and school task updates during testing
            if (!endpoint.includes('schools/name') &&
                !endpoint.includes('schools/law-schools') &&
                !endpoint.includes('schools/tasks') &&
                !endpoint.includes('schools/user') &&
                !endpoint.includes('api/schools/user')) {
                try {
                    const session = await Auth.currentSession();
                    const accessToken = session.getAccessToken().getJwtToken();
                    if (accessToken) {
                        headers.set("Authorization", `Bearer ${accessToken}`);
                    }
                } catch (error) {
                    console.error("Error fetching session:", error);
                }
            }
            return headers;
        }
    }),
    reducerPath: 'api',
    tagTypes: ["Projects", "Tasks", "Users", "Teams", "Payment", "UserTasks", "Schools", "UserSchools"],
    endpoints: (build) => ({
        getAuthUser: build.query<AuthData, void>({
            queryFn: async (_, _queryApi, _extraOptions, fetchWithBQ) => {
                try {
                    const cognitoUser = await Auth.currentAuthenticatedUser();
                    if (!cognitoUser) {
                        console.error("No user found in Cognito.");
                        throw new Error("No user found");
                    }

                    const user = {
                        username: cognitoUser.getUsername(),
                        attributes: cognitoUser.attributes || {},
                    };

                    const userSub = user.attributes.sub;
                    const userDetailsResponse = await fetchWithBQ(`users/resolve?cognitoSub=${userSub}`);

                    if (userDetailsResponse.error) {
                        const errorMessage = (userDetailsResponse.error.data as { message?: string })?.message || "Failed to fetch user details from /users/resolve";
                        console.error("Error fetching user details:", errorMessage);
                        throw new Error(errorMessage);
                    }

                    const resolvedData = userDetailsResponse.data as ResolveUserResponse;
                    return { data: { user, userSub, userDetails: resolvedData } };
                } catch (error: any) {
                    console.error("Error in getAuthUser query:", error);
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

        getTasksByUser: build.query<UserTasks[], { userId: number; projectId: number }>({
            query: ({ userId, projectId }) => `api/tasks/user-tasks?userId=${userId}&projectId=${projectId}`,
            providesTags: ["Tasks"],
        }),

        createUserTask: build.mutation<UserTasks, { userId: number; taskId: number }>({
            query: (data) => ({
                url: "api/tasks/user-tasks",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["UserTasks"],
        }),

        createTask: build.mutation<Task, Partial<Task>>({
            query: (task) => ({
                url: "tasks",
                method: "POST",
                body: task,
            }),
            invalidatesTags: ["Tasks"],
        }),

        updateTaskStatus: build.mutation<Task, { taskId: string; status: string; position: number; userId: string }>({
            query: ({ taskId, status, position, userId }) => ({
                url: `/api/user-tasks/${taskId}/status-position`,
                method: 'PUT',
                body: { status, position, userId }
            }),
            invalidatesTags: ['Tasks']
        }),

        getSchoolByName: build.query<School, { name: string; userId: number }>({
            query: ({ name, userId }) => `/api/schools/name/${encodeURIComponent(name)}?userId=${userId}`,
            providesTags: ["Schools"],
        }),

        getSchools: build.query<School[], number>({
            query: (userId) => `/api/schools/user/${userId}`,
            providesTags: ["Schools"]
        }),

        createSchool: build.mutation<{ id: number; school: string }, { schoolName: string; userId: number }>({
            query: (data) => ({
                url: "/api/schools",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Schools", "Tasks", "UserTasks"],
        }),

        getLawSchools: build.query<{ school_id: string; school_name: string }[], void>({
            query: () => "/api/law-schools",
            providesTags: ["Schools"]
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

        updateUser: build.mutation<void, { userId: number; selectedTrack: string }>({
            query: (data) => ({
                url: "users/update",
                method: "PATCH",
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
            invalidatesTags: ["Users"],
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

        getUserTasks: build.query<UserTasks[], { userId: number; projectId: number }>({
            query: ({ userId, projectId }) => `api/tasks/user-tasks?userId=${userId}&projectId=${projectId}`,
            providesTags: ["Tasks"],
        }),

        getBoardViewTasks: build.query<UserTasks[], { userId: number; projectId: number }>({
            query: ({ userId, projectId }) => `api/tasks/board-view-tasks?userId=${userId}&projectId=${projectId}`,
            providesTags: ["Tasks"],
        }),

        updateUserTaskStatus: build.mutation<void, {
            userId: number;
            taskId: number;
            status: string;
            position: number;
        }>({
            query: ({ userId, taskId, status, position }) => ({
                url: `/api/tasks/${taskId}/status-position`,
                method: 'PUT',
                body: { 
                    userId,
                    status,
                    position
                },
            }),
            invalidatesTags: ['Tasks'],
        }),

        getUserProjects: build.query<Project[], number>({
            query: (userId) => `/users/${userId}/projects`,
        }),

        addUserSchool: build.mutation<void, { userId: number; schoolId: number }>({
            query: (data) => ({
                url: `/api/schools/user`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Schools"],
        }),

        getUserSchools: build.query<{
            id: number;
            school: string;
            isSelected: boolean;
            completionPercentage: number;
            tasksCompleted: number;
            totalTasks: number;
            schoolTasks: SchoolTask[];
          }[], number>({
            query: (userId) => `/api/user/${userId}/schools`,
            transformResponse: (response: any[]): {
              id: number;
              school: string;
              isSelected: boolean;
              completionPercentage: number;
              tasksCompleted: number;
              totalTasks: number;
              schoolTasks: SchoolTask[];
            }[] => {
              // Map over the raw response and provide default values if necessary.
              return response.map((item) => ({
                id: item.id,
                school: item.school,
                isSelected: item.isSelected,
                completionPercentage: typeof item.completionPercentage === 'number' ? item.completionPercentage : 0,
                tasksCompleted: typeof item.tasksCompleted === 'number' ? item.tasksCompleted : 0,
                totalTasks: typeof item.totalTasks === 'number' ? item.totalTasks : 0,
                schoolTasks: item.schoolTasks || [],
              }));
            },
            providesTags: ["UserSchools"],
          }),
          

          updateSchoolTaskStatus: build.mutation<UserTasks, { taskId: string; status: string; position?: number; userId: number }>({
            query: ({ taskId, status, position, userId }) => ({
              url: `/api/schools/tasks/${taskId}/status`, // Notice the '/schools/tasks' prefix
              method: 'PUT',
              body: { status, position, userId },
            }),
            invalidatesTags: ['Schools', 'Tasks', 'UserTasks'],
          }),
    }),
});

export const {
  useUpdateSchoolTaskStatusMutation,
  useAddUserSchoolMutation,
    useGetProjectsQuery,
    useCreateProjectMutation,
    useGetTasksQuery,
    useCreateTaskMutation,
    useUpdateTaskStatusMutation,
    useSearchQuery,
    useGetUsersQuery,
    useGetTeamsQuery,
    useGetAuthUserQuery,
    useLogPaymentMutation,
    useUpdateUserStatusMutation,
    useCreateFreshUserMutation,
    useCreateUserMutation,
    useUpdateAfterPaymentMutation,
    useUpdateUserTaskStatusMutation,
    useGetUserTasksQuery,
    useCreateUserTaskMutation,
    useGetTasksByUserQuery,
    useUpdateUserMutation,
    useGetUserProjectsQuery,
    useCreateSchoolMutation,
    useGetSchoolsQuery,
    useGetSchoolByNameQuery,
    useGetLawSchoolsQuery,
    useGetUserSchoolsQuery,
    useGetBoardViewTasksQuery,
} = api;
