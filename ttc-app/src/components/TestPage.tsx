'use client';
import React, { useState } from "react";
import { useCreateFreshUserMutation } from "../state/api";

const TestPage: React.FC = () => {
  const [cognitoId, setCognitoId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [response, setResponse] = useState("");

  // Use the mutation hook from your Redux Toolkit setup
  const [createFreshUser] = useCreateFreshUserMutation();

  const handleSubmit = async () => {
    try {
      // Call the mutation with form data
      const result = await createFreshUser({
        cognitoId,
        username,
        email,
        firstName,
        lastName,
      });

      if ("error" in result) {
        setResponse(`Error: ${JSON.stringify(result.error, null, 2)}`);
      } else {
        setResponse(JSON.stringify(result.data, null, 2));
      }
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
      <div style={{ marginBottom: "10px" }}>
        <label>
          First Name:
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Last Name:
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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
