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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://7b5we67gn6.execute-api.us-east-1.amazonaws.com/prod';
      
      try {
        console.log('Making API request to:', apiUrl);
        const response = await fetch(
          `${apiUrl}/api/users/resolve?cognitoSub=${cognitoSub}`,
          {
            method: 'GET',
            mode: 'cors',
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
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      setError('There was a problem with your account. Please contact support or try again.');
    }
  };
  
  
  
  

  const goToConfirmPage = () => {
    // Pass the username so the confirm page knows which account to confirm
    router.push(`/confirm?username=${formData.username}`);
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
