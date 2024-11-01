// src/components/SignIn.tsx
'use client';

import React, { useState } from 'react';
import { signIn } from '../utils/cognito';
import { useAuth } from '../context/AuthContext';

const SignIn: React.FC = () => {
  const { setUser, setSession } = useAuth();
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
  }>({
    username: '',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignIn = async () => {
    setError(null);
    try {
      const result = await signIn(formData.username, formData.password);
      console.log('Sign-in successful:', result);
      setUser(result.getIdToken().payload); // Example: Set user info
      setSession(result);
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(err.message || 'Error signing in. Please try again.');
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        name="username"
        type="text"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username"
      />
      <br />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
      />
      <br />
      <button onClick={handleSignIn}>Sign In</button>
    </div>
  );
};

export default SignIn;
