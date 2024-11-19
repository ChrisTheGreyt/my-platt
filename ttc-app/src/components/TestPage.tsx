'use client';
import React, { useState } from "react";

const TestPage: React.FC = () => {
  const [cognitoId, setCognitoId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const endpoint = `${apiUrl}/api/users/create-user`;

      const body = JSON.stringify({
        cognitoId,
        username,
        email,
      });

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      if (!res.ok) {
        const errorText = await res.text();
        setResponse(`Error: ${res.status} ${errorText}`);
        return;
      }

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Create User Test</h1>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Cognito ID:
          <input
            type="text"
            value={cognitoId}
            onChange={(e) => setCognitoId(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </label>
      </div>
      <button
        onClick={handleSubmit}
        style={{
          backgroundColor: "#007bff",
          color: "white",
          padding: "10px 15px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Create User
      </button>
      <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
        <h2>Response:</h2>
        <pre>{response}</pre>
      </div>
    </div>
  );
};

export default TestPage;