import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthData } from "../state/authSlice";
import { setUser, setSelectedProjectId } from '../state';
import { Auth } from 'aws-amplify';
import { AuthData } from '@/state/api';
import { store } from '@/state/store';

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get the current authenticated user
        const currentUser = await Auth.currentAuthenticatedUser();
        console.log("<AuthInitializer> Cognito Current User:", currentUser);
        const cognitoSub = currentUser.attributes.sub; // Extract Cognito sub
        const email = currentUser.attributes.email; // Extract email (optional for debugging)
  
        // Fetch user details from the backend
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'; // Fallback to localhost
        const response = await fetch(`${backendUrl}/api/users/resolve?cognitoSub=${cognitoSub}`);
        
        if (!response.ok) {
          console.error('Failed to fetch user details from the backend');
          return;
        }
        
        console.log("AppInitializer useEffect executed");


        // Parse the response
        const userData = await response.json();
  
        // Extract user details
        const userId = userData.userId; // Database User ID
        const selectedTrack = userData.selectedTrack; // Track info
  
        // Dispatch the user data to Redux
        dispatch(
          setUser({
            user: {
              attributes: { sub: cognitoSub, email },
              username: currentUser.username,
            },
            userSub: cognitoSub,
            userDetails: {
              userId,
              selectedTrack,
              email,
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              subscriptionStatus: userData.subscriptionStatus || "",
              profilePictureUrl: userData.profilePictureUrl || "",
            },
          })
        );
        
        // Check Redux state immediately after dispatch
        setTimeout(() => {
          console.log("Redux state after dispatch:", store.getState());
        }, 1000); // Delay to ensure state is updated
      

      
      console.log("Dispatched setUser action. Check Redux state:");
      console.log(store.getState().auth);
      
        
        console.log("Dispatching setUser with:", {
          user: {
            attributes: { sub: cognitoSub, email },
            username: currentUser.username,
          },
          userSub: cognitoSub,
          userDetails: {
            userId,
            selectedTrack,
            email,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            subscriptionStatus: userData.subscriptionStatus || '',
            profilePictureUrl: userData.profilePictureUrl || '',
          },
        });
        console.log("Auth Data after dispatch:", store.getState());

        // Determine the default project ID
        const defaultProjectId = 1; // Replace this with dynamic logic if needed
  
        // Dispatch the project ID to Redux
        dispatch(setSelectedProjectId(defaultProjectId));
  
        // Debugging logs
        console.log('Cognito User ID:', cognitoSub);
        console.log('Database User ID:', userId);
        console.log('Selected Track:', selectedTrack);
        console.log('Default Project ID:', defaultProjectId);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
  
    fetchUserData();
  }, [dispatch]);
  
  

  return <>{children}</>;
};

export default AppInitializer;
