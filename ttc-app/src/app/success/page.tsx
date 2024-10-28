"use client";

import React, { useEffect, useState } from 'react';
import { useLogPaymentMutation } from '@/state/api';

const SuccessPage = () => {
  const [logPayment] = useLogPaymentMutation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    
    if (sessionId) {
      fetch(`https://main.d249lhj5v2utjs.amplifyapp.com/success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success Data:", data);
          // Handle success, perhaps redirect to the dashboard or show a success message
        })
        .catch((error) => {
          console.error('Error verifying session:', error);
          // Handle error, maybe show an error message
        })
        .finally(() => setLoading(false));
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
