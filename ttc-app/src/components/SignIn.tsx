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

  const handleSignIn = async () => {
    setError(null);
    setShowConfirmOption(false);
    setLoading(true);
  
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  
      // Cognito Sign-in
      const result = await Auth.signIn(formData.username, formData.password);
      console.log('Cognito Auth result:', result);
  
      const cognitoId = result.attributes.sub;
      console.log('Extracted Cognito ID:', cognitoId);
  
      // Resolve endpoint
      const resolveResponse = await fetch(`${backendUrl}/api/users/resolve?cognitoSub=${cognitoId}`);
      console.log('Resolve API Response:', resolveResponse);
  
      if (resolveResponse.status === 404) {
        console.warn('User not found in database. Redirecting to subscriptions.');
        router.replace('/subscriptions');
        return;
      } else if (resolveResponse.status === 403) {
        console.warn('User subscription inactive. Redirecting to subscriptions.');
        router.replace('/subscriptions');
        return;
      } else if (!resolveResponse.ok) {
        console.error('Unexpected error resolving user:', resolveResponse.statusText);
        throw new Error('Failed to resolve user');
      }
  
      const data = await resolveResponse.json();
      console.log('Resolved User Data:', data);
  
      if (data.subscriptionStatus === 'active') {
        console.log('User subscription status is active.');
        setUser(data.user); // Save user state
        setSession(result.signInUserSession); // Save session data
        router.replace('/'); // Redirect
        window.location.reload(); // Force refresh
      } else {
        console.warn('User subscription status is not active. Redirecting to subscriptions.');
        router.replace('/subscriptions');
      }
    } catch (err) {
      console.error('Error during sign in or resolve process:', err);
      setError('There was a problem with your account. Please contact support or try again.');
    } finally {
      setLoading(false);
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
