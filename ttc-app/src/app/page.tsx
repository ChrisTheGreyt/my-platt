// src/app/page.tsx
'use client';

import React from 'react';
import SignUp from '../components/SignUp';
import SignIn from '../components/SignIn';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user, session } = useAuth();

  return (
    <div>
      {user && session ? (
        <div>
          <h2>Welcome, {user.getUsername()}!</h2>
          {/* Render authenticated user content here */}
        </div>
      ) : (
        <div>
          <SignUp />
          <SignIn />
        </div>
      )}
    </div>
  );
};

export default HomePage;
