// src/context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import { getCurrentUser } from '../utils/cognito';

interface AuthContextType {
  user: CognitoUser | null;
  session: CognitoUserSession | null;
  username: string | null;
  setUsername: React.Dispatch<React.SetStateAction<string | null>>;
  setUser: React.Dispatch<React.SetStateAction<CognitoUser | null>>;
  setSession: React.Dispatch<React.SetStateAction<CognitoUserSession | null>>;
  isConfirmed: boolean;
  setIsConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [session, setSession] = useState<CognitoUserSession | null>(null);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      currentUser.getSession((err, session) => {
        if (err) {
          console.error('Error getting session:', err);
          setUser(null);
          setSession(null);
          setIsConfirmed(false);
        } else {
          setUser(currentUser);
          setSession(session);
          // Check if the user is confirmed
          currentUser.getUserAttributes((err, attributes ) => {
            if (err) {
              console.error('Error getting user attributes:', err);
              setIsConfirmed(false);
            } else {
              const emailVerified = attributes.find(attr => attr.Name === 'email_verified');
              setIsConfirmed(emailVerified?.Value === 'true');
            }
          });
        }
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, username, setUsername, setUser, setSession, isConfirmed, setIsConfirmed }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
