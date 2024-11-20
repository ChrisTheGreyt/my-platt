'use client';

import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const ConfirmSignUp: React.FC = () => {
  const { setIsConfirmed } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('signUpUsername');
    console.log('Retrieved username from localStorage:', storedUsername);
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setError('Username is missing. Please go back and sign up again.');
    }
  }, []);

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!username) {
        setError('Username is missing. Please go back and sign up again.');
        setLoading(false);
        return;
      }

      // Confirm the sign-up with Cognito
      await Auth.confirmSignUp(username, code);
      console.log('User confirmed successfully');

      // Generate the JWT token after confirmation
      const session = await Auth.currentSession();
      const accessToken = session.getAccessToken().getJwtToken();

      console.log('Access token:', accessToken);

      // Store the token securely
      localStorage.setItem('jwtToken', accessToken);

      // Retrieve email from localStorage
      const email = localStorage.getItem('signUpEmail');
      console.log('Retrieved email from localStorage:', email);

      // Redirect to the subscription page
      if (email) {
        router.push(`/subscriptions?username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`);
      } else {
        console.error('Email not found in local storage.');
        setError('Unable to retrieve email. Please try logging in.');
      }

      // Clear localStorage
      console.log('Clearing localStorage - username and email');
      localStorage.removeItem('signUpEmail');
      localStorage.removeItem('signUpUsername');
    } catch (error: any) {
      console.error('Error during confirmation:', error);
      setError(error.message || 'An error occurred during account confirmation.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!username) {
        setError('Username is missing. Please go back and sign up again.');
        setLoading(false);
        return;
      }

      // Resend the confirmation code
      await Auth.resendSignUp(username);
      console.log('Confirmation code resent');
      setSuccess('Confirmation code resent! Please check your email.');
    } catch (err: any) {
      console.error('Error resending code:', err);
      setError(err.message || 'Failed to resend confirmation code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '5px',
      }}
    >
      <h2>Confirm Your Account</h2>
      <p>Please enter the confirmation code sent to your email.</p>
      <form onSubmit={handleConfirmSignUp}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <input
          type="text"
          placeholder="Confirmation Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '15px',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Confirming...' : 'Confirm Account'}
        </button>
      </form>
      <p style={{ marginTop: '15px' }}>
        Didn't receive a code?{' '}
        <button
          onClick={handleResendCode}
          style={{
            background: 'none',
            border: 'none',
            color: '#0070f3',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Resend Code
        </button>
      </p>
    </div>
  );
};

export default ConfirmSignUp;
