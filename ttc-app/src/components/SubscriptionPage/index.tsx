// src/components/SubscriptionPage/index.tsx

"use client"; // Client Component

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(stripePublicKey || '');

const SubscriptionPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [promotionCode, setPromotionCode] = useState<string>('');

  useEffect(() => {
    const retrievedUsername = searchParams.get('username');
    const retrievedEmail = searchParams.get('email');
    
    // Set the retrieved values in state
    setUsername(retrievedUsername);
    setEmail(retrievedEmail);

    console.log("Retrieved username from URL:", retrievedUsername);
    console.log("Retrieved email from URL:", retrievedEmail);

    // Set error if username is missing
    if (retrievedUsername) {
      localStorage.setItem('username', retrievedUsername);
      console.log('Username is', retrievedUsername);
    }
    if (!retrievedUsername) {
      setError('Username is missing. Please go back and sign up again.');
    }
  }, [searchParams]);

  const handleSubscription = async (priceId: string, planType: string) => {
    console.log("email:", email);
    console.log("username:", username);
    console.log("priceId:", priceId);
    console.log("planType:", planType);
    console.log("promotionCode:", promotionCode);
  
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    const stripe = await stripePromise;
  
    if (!stripe) {
      console.error("Stripe has not been initialized properly.");
      setError('Stripe has not been initialized properly.');
      setLoading(false);
      return;
    }
  
    try {
      // Call the backend to create a Stripe Checkout session
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          email,
          username,
          planType,
          promotionCode,
        }),
      });
  
      const data = await response.json();
      console.log('Backend response:', data);
  
      // const { sessionId } = data;
      const sessionId = data.sessionId || data.id;
  
      if (!sessionId) {
        setError('An error occurred while creating the checkout session.');
        setLoading(false);
        return;
      }
  
      console.log('Stripe sessionId:', sessionId);
  
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
  
      
      if (error) {
        console.error('Stripe redirection failed:', error.message);
        setError(error.message || 'An unexpected error occurred during Stripe redirection.');
      }
      
    } catch (err) {
      console.error('Unexpected error during subscription:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Select a Subscription Plan</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Collect the user's email */}
        <div className="mb-6">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email ?? ""}
            readOnly
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Monthly Plan */}
          <div
            className="relative bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-2xl transition-transform transform hover:scale-105"
            onClick={() => handleSubscription('price_1QBKbpG8jnQLC5SAmZ0CFHhO', 'subscription')}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-400 rounded-t-lg"></div>
            <h2 className="text-2xl font-semibold mt-2">MyPLATT Monthly</h2>
            <p className="mt-2 text-gray-600">$75 / Monthly</p>
            <p className="mt-2 text-sm text-gray-500">Access to all features for 30 days.</p>
          </div>


          {/* 6-Month Plan */}
          <div
            className="relative bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-2xl transition-transform transform hover:scale-105"
            onClick={() => handleSubscription('price_1QPp1IG8jnQLC5SAi8U6QAel', 'one-time')}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-t-lg"></div>
            <h2 className="text-2xl font-semibold mt-2">MyPLATT 6 Months</h2>
            <p className="mt-2 text-gray-600">$400 / 6 Months</p>
            <p className="mt-2 text-sm text-gray-500">Save with a 6-month subscription.</p>
          </div>

          {/* Yearly Plan */}
          <div
            className="relative bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-2xl transition-transform transform hover:scale-105"
            onClick={() => handleSubscription('price_1QBKeDG8jnQLC5SA2gOWRfA2', 'one-time')}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 rounded-t-lg"></div>
            <h2 className="text-2xl font-semibold mt-2">MyPLATT Yearly</h2>
            <p className="mt-2 text-gray-600">$800 / Yearly</p>
            <p className="mt-2 text-sm text-gray-500">Best value with a yearly subscription.</p>
          </div>

            {/* Promotion code */}
            <div className="mb-6">
              <label htmlFor="promotionCode" className="block text-gray-700 text-sm font-bold mb-2">
                Promotion Code (optional)
              </label>
              <input
                id="promotionCode"
                type="text"
                value={promotionCode}
                onChange={(e) => setPromotionCode(e.target.value)} // Update promotionCode on change
                placeholder="Enter your code"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

        </div>

        {loading && <p className="text-blue-500 text-center mt-4">Processing...</p>}
      </div>
    </div>
  );
};

export default SubscriptionPage;
