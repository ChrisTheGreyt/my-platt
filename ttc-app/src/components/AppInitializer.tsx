import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setSelectedProjectId } from '../state';
import { Auth } from 'aws-amplify';
import { store } from '@/state/store';

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser();
        if (!currentUser) {
          console.warn("<AppInitializer> No authenticated user found.");
          return;
        }

        console.log("<AppInitializer> Cognito Current User:", currentUser);

        const cognitoSub = currentUser.attributes.sub;
        const email = currentUser.attributes.email;
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

        const response = await fetch(
          `${backendUrl}/api/users/resolve?cognitoSub=${cognitoSub}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          console.error('Failed to fetch user details from the backend. Status:', response.status);
          return;
        }
        
        const userData = await response.json();
        // userData should contain { userId, selectedTrack, subscriptionStatus, ... }

        const userId = userData.userId;
        const selectedTrack = userData.selectedTrack;
        const subscriptionStatus = userData.subscriptionStatus || '';
        const firstName = userData.firstName || '';
        const lastName = userData.lastName || '';
        const profilePictureUrl = userData.profilePictureUrl || '';

        // Dispatch the user data to Redux
        dispatch(
          setUser({
            user: {
              attributes: { sub: cognitoSub, email },
              username: currentUser.username,
            },
            userSub: cognitoSub,
            userDetails: {
              userId: userData.userId,
              selectedTrack: userData.selectedTrack,
              email,
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              subscriptionStatus: userData.subscriptionStatus || "",
              profilePictureUrl: userData.profilePictureUrl || "",
            },
          })
        );
        

        // Log Redux state after a short delay
        setTimeout(() => {
          console.log("Redux state after dispatch:", store.getState());
        }, 1000); 

        console.log("Dispatched setUser action. Check Redux state:");
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
            firstName,
            lastName,
            subscriptionStatus,
            profilePictureUrl,
          },
        });

        console.log("Auth Data after dispatch:", store.getState());

        // Determine the default project ID
        const defaultProjectId = 1; 
        dispatch(setSelectedProjectId(defaultProjectId));
  
        // Debug logs
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
