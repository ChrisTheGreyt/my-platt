'use client';

import React, { useState } from 'react';

const TestPage = () => {
  const [formData, setFormData] = useState({
    sessionId: '',
    firstName: '',
    lastName: '',
    username: '',
    profilePictureUrl: '',
  });
  const [response, setResponse] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/users/update-after-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(`Success: ${JSON.stringify(data)}`);
      } else {
        setResponse(`Error: ${data.message || 'Unknown error'}`);
      }
    } catch (error: any ) {
      console.error('Error submitting form:', error);
      setResponse(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test User Creation</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Session ID:</label>
          <input
            type="text"
            name="sessionId"
            value={formData.sessionId}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Profile Picture URL:</label>
          <input
            type="text"
            name="profilePictureUrl"
            value={formData.profilePictureUrl}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <div style={{ marginTop: '1rem' }}>
        <strong>Response:</strong> {response}
      </div>
    </div>
  );
};

export default TestPage;
