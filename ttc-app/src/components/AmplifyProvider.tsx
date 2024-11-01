// src/components/AmplifyProvider.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js'; // Ensure correct import
import { cognitoConfig } from '../config/cognito';
import { signUp, signIn, signOut, getCurrentUser } from '../utils/cognito';

interface AmplifyProviderProps {
  children: ReactNode;
}

const AmplifyProvider: React.FC<AmplifyProviderProps> = ({ children }) => {
  useEffect(() => {
    // Configuration is handled in utils/cognito.ts
    console.log('AmplifyProvider mounted');
  }, []);

  return <>{children}</>;
};

export default AmplifyProvider;
