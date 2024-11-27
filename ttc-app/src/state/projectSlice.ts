// src/state/projectSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProjectState {
  projectId: number | null; // Store the selected project ID
}

const initialState: ProjectState = {
  projectId: null, // Default to null
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setSelectedProjectId: (state, action: PayloadAction<number>) => {
      state.projectId = action.payload; // Update the project ID
    },
    clearProject: (state) => {
      state.projectId = null; // Reset the project ID
    },
  },
});

export const { setSelectedProjectId, clearProject } = projectSlice.actions;
export default projectSlice.reducer;
