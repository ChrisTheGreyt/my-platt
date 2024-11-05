"use client";

import React, { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';

const SuccessPage = () => {
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  useEffect(() => {
    const sessionIdFromURL = new URLSearchParams(window.location.search).get('session_id');
    const queryParams = new URLSearchParams(window.location.search);
    const usernameFromURL = queryParams.get('username');

    setFormData((prev) => ({
      ...prev,
      username: usernameFromURL || '', // Set username directly from URL
    }));

    if (!usernameFromURL) {
      setError('Username is missing. Please try registering again.');
      setLoading(false);
      return;
    }

    if (sessionIdFromURL) {
      setSessionId(sessionIdFromURL);
    } else {
      setError('Invalid session. Please try registering again.');
      setLoading(false);
    }

    if (sessionIdFromURL && usernameFromURL) {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
  
    console.log("Form Data - First Name:", formData.firstName);
    console.log("Form Data - Last Name:", formData.lastName);
    console.log("Form Data - Username:", formData.username);

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
      let uploadedImageUrl = formData.profilePictureUrl;

      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`, {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          uploadedImageUrl = uploadData.filePath;
        } else {
          setError(uploadData.error || 'Failed to upload image.');
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        sessionId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        profilePictureUrl: uploadedImageUrl,
      };
      console.log("Payload to be sent:", payload);

      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/update-after-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await updateResponse.json();
      console.log("Server Response:", result);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to update user information.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while updating your information.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen text-lg">Loading...</div>;

  return (
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
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Profile Picture:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full mb-2"
            />
            <p className="text-sm text-gray-500">or enter an image URL below:</p>
            <input
              type="text"
              name="profilePictureUrl"
              value={formData.profilePictureUrl}
              onChange={handleInputChange}
              placeholder="Enter image URL"
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
  );
};

export default SuccessPage;
