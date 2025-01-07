"use client";

import React, { useState, useEffect } from "react";
import { Auth } from "aws-amplify";

const SuccessPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load data from localStorage
    const username = localStorage.getItem("signUpUsername") || "";
    const firstName = localStorage.getItem("signUpFirstName") || "";
    const lastName = localStorage.getItem("signUpLastName") || "";

    setFormData((prev) => ({
      ...prev,
      username,
      firstName,
      lastName,
    }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Log in the user with Cognito
      const user = await Auth.signIn(formData.username, formData.password);
      console.log("User logged in successfully:", user);

      // Retrieve the JWT token
      const jwtToken = user.signInUserSession.accessToken.jwtToken;
      console.log("JWT Token:", jwtToken);

      // Prepare the payload
      const payload = {
        cognitoId: user.attributes.sub,
        username: formData.username,
        email: user.attributes.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        profilePictureUrl: "pd1.jpg",
        selectedTrack: "2026",
      };

      console.log("Payload to send:", payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Server response:", result);

      if (response.ok) {
        setSuccess(true);
        // Redirect to /home after successful login
        window.location.href = "/home";
      } else {
        setError(result.message || "Failed to create user.");
      }
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "An error occurred during login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-green-500 mb-4">Payment Successful</h1>
        <p className="text-center text-gray-700 mb-6">Log in to your account to complete the setup.</p>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">User created successfully!</p>}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="hidden">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              readOnly
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              readOnly
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-2 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 disabled:bg-gray-300"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuccessPage;
