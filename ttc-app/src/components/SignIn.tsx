'use client';

import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import { CognitoUser } from '@aws-amplify/auth'; // Import CognitoUser from auth types
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const SignIn: React.FC = () => {
  const router = useRouter();
  const { setUser, setSession } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await Auth.signIn(formData.username, formData.password);

      // Create a simplified version of the user object for state storage
      const serializableUser = {
        username: result.getUsername(),
        attributes: result.attributes,
      };

      setUser(serializableUser); // Set only serializable properties in context
      setSession(result); // Save full session if needed
      setCognitoUser(result); // Store full CognitoUser locally
      router.push('/home'); // Redirect to home page after login
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(err.message || 'Error signing in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="mb-4">
        <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
          Username
        </label>
        <input
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter your username"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
          Password
        </label>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition duration-200"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </div>
  );
};

export default SignIn;
