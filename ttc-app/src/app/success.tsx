import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useLogPaymentMutation } from '@/state/api';

const SuccessPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { session_id } = router.query;
  const [logPayment] = useLogPaymentMutation();

  useEffect(() => {
    if (session_id) {
      fetch(`https://main.d249lhj5v2utjs.amplifyapp.com/success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: session_id }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success Data:", data);
          // Handle success, perhaps redirect to the dashboard or show a success message
        })
        .catch((error) => {
          console.error('Error verifying session:', error);
          // Handle error, maybe show an error message
        });
    }
  }, [session_id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Thank you for your subscription.</p>
    </div>
  );
};

export default SuccessPage;
