// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import SignUp from '../components/SignUp';
import SignIn from '../components/SignIn';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user, session } = useAuth();
  const [isSignIn, setIsSignIn] = useState(true); // Toggle between SignIn and SignUp

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-800 p-4">
      {user && session ? (
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold">Welcome, {user.getUsername()}!</h2>
          {/* Render authenticated user content here */}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            {isSignIn ? 'Sign In' : 'Sign Up'}
          </h2>

          {/* Toggle between SignIn and SignUp */}
          {isSignIn ? <SignIn /> : <SignUp />}

          <div className="text-center mt-4">
            {isSignIn ? (
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => setIsSignIn(false)}
                  className="text-blue-500 hover:underline"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setIsSignIn(true)}
                  className="text-blue-500 hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
