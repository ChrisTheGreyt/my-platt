import React, { useEffect, useState } from 'react';
import { useLogPaymentMutation } from '@/state/api';

const SuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [logPayment] = useLogPaymentMutation();

  useEffect(() => {
    // Extract the session_id from the URL's search params directly
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      fetch(`https://main.d249lhj5v2utjs.amplifyapp.com/api/payment-success`, { // Update to the correct endpoint if needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success Data:", data);
          setLoading(false);
          // Handle success, such as redirecting to the dashboard or displaying a success message
        })
        .catch((error) => {
          console.error('Error verifying session:', error);
          setLoading(false);
          // Handle error, perhaps show an error message
        });
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
