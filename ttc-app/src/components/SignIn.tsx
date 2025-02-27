'use client';

import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const SignIn: React.FC = () => {
  const router = useRouter();
  const { setUser, setSession } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmOption, setShowConfirmOption] = useState<boolean>(false);
  const [maintenanceMode] = useState(false); // Set to false to disable maintenance message
  const maintenanceMessage = "We are currently performing system maintenance. Login will be available shortly.";

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
          return response; // Don't retry 404s
        }
        console.log(`Attempt ${i + 1} failed with status ${response.status}`);
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
    throw new Error(`Failed after ${retries} retries`);
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      console.log('Attempting sign in...');
      const auth = await Auth.signIn(formData.username, formData.password);
      console.log('Sign in successful:', auth);

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

      // Use environment-specific API URL
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000'  // Local development API
        : process.env.NEXT_PUBLIC_API_URL;
      
      console.log('Environment:', process.env.NODE_ENV);
      console.log('API URL:', apiUrl);

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

        // Log the response headers for debugging
        console.log('Response headers:', {
          cors: response.headers.get('access-control-allow-origin'),
          contentType: response.headers.get('content-type'),
          status: response.status
        });

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
    }
  };
  
  
  
  

  const goToConfirmPage = () => {
    // Pass the username so the confirm page knows which account to confirm
    router.push(`/confirm?username=${formData.username}`);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      {/* Add maintenance message banner */}
      {maintenanceMode && (
        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <p className="font-medium">System Maintenance</p>
          <p className="text-sm">{maintenanceMessage}</p>
        </div>
      )}

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Disable form when in maintenance mode */}
      <fieldset disabled={maintenanceMode}>
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
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
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
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <button
          onClick={handleSignIn}
          disabled={loading || maintenanceMode}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition duration-200 disabled:bg-gray-400"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </fieldset>

      {showConfirmOption && (
        <div className="mt-4 text-center">
          <p className="text-gray-700 mb-2">
            Your account is not confirmed yet. Please confirm your account.
          </p>
          <button
            onClick={goToConfirmPage}
            className="underline text-blue-500 hover:text-blue-700"
          >
            Confirm Your Account
          </button>
        </div>
      )}

      <div className="mt-4 text-center">
        <button
          onClick={() => router.push('/reset-password')}
          className="text-blue-500 hover:underline"
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
};

export default SignIn;
