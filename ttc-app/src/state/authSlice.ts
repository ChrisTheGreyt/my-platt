import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { AuthData } from "@/state/api";

// Define the shape of UserDetails within AuthData
interface UserDetails {
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

interface AuthData {
  user: { username: string; attributes: Record<string, string> };
  userSub: string;
  userDetails: UserDetails;
}

interface User {
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

interface AuthState {
  user: AuthData | null;
  userDetails: UserDetails | null;
  userId: number | null;
  selectedTrack: string | null;
  authData: any;
}

const initialState: AuthState = {
  user: null,
  userDetails: null,
  userId: null,
  selectedTrack: null,
  authData: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<AuthState["authData"]>) => {
      state.authData = action.payload;
    },

    setUser: (state, action: PayloadAction<AuthData>) => {
      console.log("setUser reducer invoked with payload:", action.payload);
  
      state.user = action.payload;
  
      // Store the actual details
      state.userDetails = action.payload.userDetails || null;
  
      state.userId = action.payload.userDetails?.userId || null;
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



export const { setAuthData, setUser, clearAuthUser } = authSlice.actions;
export default authSlice.reducer;
