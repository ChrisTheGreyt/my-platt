'use client';

import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const DevSignIn: React.FC = () => {
  const router = useRouter();
  const { setUser, setSession } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Copy your existing handleChange and fetchWithRetry functions from SignIn.tsx
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fetchWithRetry = async (url: string, options: RequestInit, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          return response;
        }
        if (response.status === 404) {
          return response;
        }
        console.log(`Attempt ${i + 1} failed with status ${response.status}`);
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
      }
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
    throw new Error(`Failed after ${retries} retries`);
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      console.log('Attempting dev sign in...');
      const auth = await Auth.signIn(formData.username, formData.password);
      console.log('Dev sign in successful:', auth);

      const session = auth.signInUserSession;
      if (!session) {
        console.error('No session after sign in');
        return;
      }

      const cognitoSub = auth.attributes?.sub;
      console.log('CognitoSub from attributes:', cognitoSub);

      if (!cognitoSub) {
        console.error('No cognitoSub found in user attributes');
        return;
      }

      // Get the current origin
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      
      // Use origin to determine environment
      const apiUrl = origin === 'https://main.d249lhj5v2utjs.amplifyapp.com'
        ? 'https://7b5we67gn6.execute-api.us-east-1.amazonaws.com/prod'
        : 'http://localhost:8000';
      
      try {
        console.log('Making API request to:', apiUrl);
        const response = await fetchWithRetry(
          `${apiUrl}/api/users/resolve?cognitoSub=${cognitoSub}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.getIdToken().getJwtToken()}`
            }
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          
          if (response.status === 404) {
            const email = auth.attributes.email;
            router.replace(`/subscriptions?username=${formData.username}&email=${encodeURIComponent(email)}`);
            return;
          }
          throw new Error(`API call failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response data:', data);

        // Save user state and session
        setUser(data);
        setSession(session);

        // Critical Subscription Status Check
        const status = (data.subscriptionStatus || '').toLowerCase();
        if (status === 'active') {
          console.log('VALID: Active subscription detected');
          router.replace('/');
          window.location.reload();
        } else {
          console.warn('INVALID: Missing active subscription');
          router.replace('/subscriptions');
        }
      } catch (error: unknown) {
        console.error('API Error:', error);
        if (error instanceof Error && error.message.includes('ERR_CONNECTION_REFUSED')) {
          setError('Unable to connect to local server. Please ensure the server is running on port 8000.');
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      console.error('Error during sign in:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
        <p className="font-medium">Developer Access Only</p>
        <p className="text-sm">This login bypass is for development purposes.</p>
      </div>

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
        className="w-full bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition duration-200"
      >
        {loading ? 'Signing In...' : 'Dev Sign In'}
      </button>

      <div className="mt-4 text-center">
        <button
          onClick={() => router.push('/login')}
          className="text-gray-500 hover:underline"
        >
          Back to Main Login
        </button>
      </div>
    </div>
  );
};

export default DevSignIn; 