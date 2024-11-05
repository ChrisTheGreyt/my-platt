// src/components/SignUp.tsx

'use client';

import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/navigation';

const SignUp: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign up the user with Cognito
      const { user } = await Auth.signUp({
        username: formData.username,
        password: formData.password,
        attributes: {
          email: formData.email,
        },
      });
      console.log('Sign-up successful:', user);

      // Store the email and username in localStorage for later
      localStorage.setItem('signUpEmail', formData.email);
      localStorage.setItem('signUpUsername', formData.username);

      // Redirect to confirmation page
      router.push('/confirm');
    } catch (error: any) {
      console.error('Error during sign-up:', error);
      setError(error.message || 'An error occurred during sign-up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSignUp}>
        <input
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
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
            cursor: 'pointer',
          }}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
