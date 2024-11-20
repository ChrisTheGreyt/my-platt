"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateUserMutation } from '@/state/api';

const SuccessPage = () => {
  const [createUser, { isLoading }] = useCreateUserMutation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    profilePictureUrl: '',
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const sessionIdFromURL = queryParams.get('session_id');
    const usernameFromURL = queryParams.get('username');

    const storedUsername = localStorage.getItem('username');
    const finalUsername = usernameFromURL || storedUsername || '';

    setFormData((prev) => ({
      ...prev,
      username: finalUsername,
    }));

    if (!finalUsername) {
      setError('Username is missing. Please try registering again.');
      setLoading(false);
      return;
    }

    if (sessionIdFromURL) {
      setSessionId(sessionIdFromURL);
    } else {
      setError('Invalid session. Please try registering again.');
      setLoading(false);
      return;
    }

    setLoading(false);

    if (success) {
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  }, [success, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.firstName || !formData.lastName || !formData.username) {
      setError('First name, last name, and username are required.');
      return;
    }

    if (!sessionId) {
      setError('Session ID is missing.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Retrieve the JWT token from localStorage
      const jwtToken = localStorage.getItem('jwtToken');
      if (!jwtToken) {
        throw new Error('JWT token is missing. Please log in again.');
      }

      const payload = {
        cognitoId: sessionId,
        username: formData.username,
        email: `${formData.username}@example.com`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        profilePictureUrl: formData.profilePictureUrl || "https://main.d249lhj5v2utjs.amplifyapp.com/pd1.jpg",
      };

      console.log("Payload to be sent:", payload);

      // Use fetch with Authorization header
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Server Response:", result);

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(result.message || 'Failed to create user.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while creating the user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen text-lg">Loading...</div>;

  return (
    <div>
      {success ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-2">Profile Updated!</h2>
            <p className="text-gray-700 mb-6">
              Thank you for updating your profile. You will be redirected to the sign-in page in a few seconds.
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
          <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-4 text-green-600">Payment Successful!</h1>
            <p className="text-center text-gray-700 mb-6">Thank you for your subscription. Please complete your profile.</p>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {success && <p className="text-green-500 text-center mb-4">Your profile has been updated successfully!</p>}

            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="firstName">First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="lastName">Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition duration-200 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessPage;
