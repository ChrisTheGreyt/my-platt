"use client";

import React, { useState } from "react";
import { Auth } from "aws-amplify";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Store the JWT token for further API calls
      localStorage.setItem("jwtToken", jwtToken);

      // Update the database with the user information
      const payload = {
        cognitoId: user.attributes.sub,
        username: formData.username,
        email: user.attributes.email,
        firstName: user.attributes.given_name || "DefaultFirstName",
        lastName: user.attributes.family_name || "DefaultLastName",
        profilePictureUrl: "https://main.d249lhj5v2utjs.amplifyapp.com/pd1.jpg",
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
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    >
      <h2>Log In</h2>
      <p>Log in to your account to complete the setup.</p>
      <form onSubmit={handleFormSubmit}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>User created successfully!</p>}
        <input
          type="text"
          placeholder="Username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            boxSizing: "border-box",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            boxSizing: "border-box",
          }}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
