import React, { useState } from 'react';

const TestPage: React.FC = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      sessionId: 'test_session_id',
      firstName: 'Chris',
      lastName: 'Grey',
      username: 'Aponex',
      profilePictureUrl: ''
    };

    try {
      const res = await fetch('https://7b5we67gn6.execute-api.us-east-1.amazonaws.com/prod/users/update-after-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(`Error: ${res.status} - ${JSON.stringify(errorData)}`);
      } else {
        const data = await res.json();
        setResponse(JSON.stringify(data));
      }
    } catch (err: any) {
      setError(`Request failed: ${err.message}`);
    }
  };

  return (
    <div>
      <h1>Test Update After Payment</h1>
      <form onSubmit={handleSubmit}>
        <button type="submit">Send Test Request</button>
      </form>
      <div>
        <h3>Response:</h3>
        <pre>{response || 'No response yet'}</pre>
        <h3>Error:</h3>
        <pre>{error || 'No errors yet'}</pre>
      </div>
    </div>
  );
};

export default TestPage;
