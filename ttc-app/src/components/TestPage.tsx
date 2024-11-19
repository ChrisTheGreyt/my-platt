'use client';

import React, { useState } from 'react';
import { useUpdateAfterPaymentMutation } from '../state/api'; // Adjust the path as needed

const TestUpdateAfterPayment = () => {
  const [updateAfterPayment] = useUpdateAfterPaymentMutation();
  const [response, setResponse] = useState('');
  const [formData, setFormData] = useState({
    sessionId: 'test_session_id',
    firstName: 'Chris',
    lastName: 'Grey',
    username: 'Aponex',
    profilePictureUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await updateAfterPayment(formData).unwrap();
      setResponse(`Success: ${JSON.stringify(result)}`);
    } catch (error: any) {
      console.error('Error:', error);
      setResponse(`Error: ${error?.data?.message || 'Unknown error'}`);
    }
  };

  return (
    <div>
      <h1>Test Update After Payment</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Session ID:</label>
          <input
            type="text"
            value={formData.sessionId}
            onChange={(e) => setFormData({ ...formData, sessionId: e.target.value })}
          />
        </div>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>
        <div>
          <label>Profile Picture URL:</label>
          <input
            type="text"
            value={formData.profilePictureUrl}
            onChange={(e) => setFormData({ ...formData, profilePictureUrl: e.target.value })}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <div>
        <h2>Response:</h2>
        <pre>{response}</pre>
      </div>
    </div>
  );
};

export default TestUpdateAfterPayment;
