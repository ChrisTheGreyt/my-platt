"use client";

import React, { useEffect, useState } from 'react';

const SuccessPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    console.log("Retrieved session ID:", sessionId);

    if (sessionId) {
      fetch('https://7b5we67gn6.execute-api.us-east-1.amazonaws.com/prod/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Success Data:", data);
          // Update local storage or state if needed
        })
        .catch((error) => {
          console.error('Error verifying session:', error);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Thank you for your subscription.</p>
    </div>
  );
};

export default SuccessPage;
