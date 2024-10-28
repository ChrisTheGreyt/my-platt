import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const SuccessPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { session_id } = router.query;

  useEffect(() => {
    const logSessionData = async () => {
      if (session_id) {
        try {
          const response = await fetch('/api/users/log-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session_id }),
          });

          const data = await response.json();
          if (data.success) {
            console.log('Subscription details logged successfully');
          } else {
            console.error('Error logging subscription details:', data.error);
          }
        } catch (error) {
          console.error('Error logging subscription details:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    logSessionData();
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
