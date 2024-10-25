import React, { useEffect } from 'react';
import Auth from '@aws-amplify/auth';

const AuthTestComponent = () => {
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        console.log('Current user:', user);
      } catch (error) {
        console.error('User not logged in:', error);
      }
    };

    checkUser();
  }, []);

  return <div>Check the console for user status</div>;
};

export default AuthTestComponent;
