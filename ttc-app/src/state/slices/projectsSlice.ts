import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchUserProjects = createAsyncThunk(
  'projects/fetchUserProjects',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/projects`);
    return await response.json();
  }
);

interface ProjectsState {
  projects: Array<{ id: string; name: string }>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ProjectsState = {
  projects: [],
  status: 'idle'
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = action.payload;
      })
      .addCase(fetchUserProjects.rejected, (state) => {
        state.status = 'failed';
      });
  }
});

export default projectsSlice.reducer;