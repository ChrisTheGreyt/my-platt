import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Extend the global state with `user` and `selectedProjectId`
export interface initialStateTypes {
    isSidebarCollapsed: boolean;
    isDarkMode: boolean;
    user: any | null; // Replace `any` with the proper type for your user if available
    selectedProjectId: number | null; // Add selectedProjectId property
}

const initialState: initialStateTypes = {
    isSidebarCollapsed: false,
    isDarkMode: false,
    user: null, // Default user is null
    selectedProjectId: null, // Default selected project ID is null
};

export const globalSlice = createSlice({
    name: "global",
    initialState,
    reducers: {
        setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
            state.isSidebarCollapsed = action.payload;
        },
        setIsDarkMode: (state, action: PayloadAction<boolean>) => {
            state.isDarkMode = action.payload;
        },
        // Add a reducer to set the user
        setUser: (state, action: PayloadAction<any | null>) => {
            state.user = action.payload;
        },
        // Add a reducer to set the selected project ID
        setSelectedProjectId: (state, action: PayloadAction<number | null>) => {
            state.selectedProjectId = action.payload;
        },
    },
});

export const {
    setIsDarkMode,
    setIsSidebarCollapsed,
    setUser, // Export the new setUser action
    setSelectedProjectId, // Export the new setSelectedProjectId action
} = globalSlice.actions;

export default globalSlice.reducer;
