"use client";

import React, { useState } from "react";
import { Auth } from "aws-amplify";
import { useRouter } from "next/navigation";

const ResetPassword = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    code: "",
    newPassword: "",
  });
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const sendResetCode = async () => {
    setError("");
    setMessage("");
    try {
      await Auth.forgotPassword(formData.username);
      setIsCodeSent(true);
      setMessage("A reset code has been sent to your email.");
    } catch (err: any) {
      console.error("Error sending reset code:", err);
      setError(err.message || "Failed to send reset code.");
    }
  };

  const resetPassword = async () => {
    setError("");
    setMessage("");
    try {
      await Auth.forgotPasswordSubmit(
        formData.username,
        formData.code,
        formData.newPassword
      );
      setMessage(
        "Your password has been reset successfully. You can now log in."
      );
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setError(err.message || "Failed to reset password.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto mt-10">
      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!isCodeSent ? (
        <>
          <h1 className="text-xl font-bold mb-4">Reset Password</h1>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={sendResetCode}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition duration-200"
          >
            Send Reset Code
          </button>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold mb-4">Enter Reset Code</h1>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Reset Code
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Enter the reset code"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={resetPassword}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition duration-200"
          >
            Reset Password
          </button>
        </>
      )}

      {/* Add redirect button after successful password reset */}
      {message ===
        "Your password has been reset successfully. You can now log in." && (
        <button
          onClick={() => router.push("/")}
          className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition duration-200"
        >
          Go to Login Page
        </button>
      )}
    </div>
  );
};

export default ResetPassword;
