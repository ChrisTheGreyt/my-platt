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
  
      // Automatically sign the user in after confirmation
      const user = await Auth.signIn(username, localStorage.getItem('signUpPassword') || '');
      console.log('User signed in successfully:', user);
  
      // Retrieve the JWT token and store it in localStorage
      const session = user.getSignInUserSession();
      if (session) {
        const jwtToken = session.getIdToken().getJwtToken();
        localStorage.setItem('jwtToken', jwtToken);
        console.log('JWT token stored in localStorage:', jwtToken);
      }
  
      // Redirect to the subscription page with email and username
      const email = localStorage.getItem('signUpEmail');
      if (email) {
        router.push(`/subscriptions?username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`);
      } else {
        setError('Unable to retrieve email. Please try logging in.');
      }
  
      // Clear sensitive data from localStorage
      localStorage.removeItem('signUpEmail');
      localStorage.removeItem('signUpUsername');
      localStorage.removeItem('signUpPassword');
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
