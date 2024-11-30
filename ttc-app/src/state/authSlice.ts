import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { AuthData } from "@/state/api";

// Define the shape of UserDetails within AuthData
interface UserDetails {
  userId?: number;
  selectedTrack?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  subscriptionStatus?: string;
  profilePictureUrl?: string;
}

interface AuthState {
  authData: any;
  user: any; // The full user object
  userDetails: any | null; // Details pulled from the backend
  userId: string | null; // Optional string-based user ID
  selectedTrack: string | null; // Optional track selection
}

const initialState: AuthState = {
  user: null, // Cognito user or full user object
  userDetails: null, // Backend user details
  userId: null, // Optional Cognito sub or backend user ID
  selectedTrack: null,
  authData: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set both userId and selectedTrack in the state
    setAuthData: (state, action: PayloadAction<AuthState["authData"]>) => {
      state.authData = action.payload;
    },


    

    setUser: (state, action: PayloadAction<AuthData>) => {
        console.log("setUser reducer invoked with payload:", action.payload);
      
        state.user = action.payload;
        state.userDetails = action.payload.userDetails || null;
        state.userId = action.payload.userDetails?.userId?.toString() || null;
        state.selectedTrack = action.payload.userDetails?.selectedTrack || null;
      
        console.log("Updated state in reducer:", state);
    },
      
      

    // Clear the authentication state
    clearAuthUser: (state) => {
      state.user = null;
      state.userDetails = null;
      state.userId = null;
      state.selectedTrack = null;
    },
  },
});

export interface AuthData {
    user: {
        attributes: { sub: string; email: string };
        username: string;
    };
    userSub: string;
    userDetails: {
        userId: number;
        selectedTrack: string;
        email: string;
        firstName: string;
        lastName: string;
        subscriptionStatus: string;
        profilePictureUrl: string;
    };
}

export const { setAuthData, setUser, clearAuthUser } = authSlice.actions;
export default authSlice.reducer;
