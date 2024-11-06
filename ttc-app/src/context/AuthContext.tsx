// src/context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CognitoUserSession } from 'amazon-cognito-identity-js';
import { getCurrentUser } from '../utils/cognito';

// Define a simplified, serializable user type
interface SerializableUser {
  username: string;
  attributes: { [key: string]: string };
}

interface AuthContextType {
  user: SerializableUser | null;
  session: CognitoUserSession | null;
  username: string | null;
  setUsername: React.Dispatch<React.SetStateAction<string | null>>;
  setUser: React.Dispatch<React.SetStateAction<SerializableUser | null>>;
  setSession: React.Dispatch<React.SetStateAction<CognitoUserSession | null>>;
  isConfirmed: boolean;
  setIsConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<SerializableUser | null>(null);
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
          // Extract serializable data from the CognitoUser object
          const serializableUser: SerializableUser = {
            username: currentUser.getUsername(),
            attributes: {}
          };
  
          // Populate attributes if they are available
          currentUser.getUserAttributes((attrErr, attributes) => {
            if (attrErr) {
              console.error('Error getting user attributes:', attrErr);
              setIsConfirmed(false);
            } else if (attributes) {
              attributes.forEach(attr => {
                serializableUser.attributes[attr.Name] = attr.Value;
              });
              const emailVerified = serializableUser.attributes['email_verified'];
              setIsConfirmed(emailVerified === 'true');
            }
          });
  
          setUser(serializableUser);
          setSession(session);
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
