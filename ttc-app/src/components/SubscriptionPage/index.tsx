// src/pages/SubscriptionPage.tsx or src/components/SubscriptionPage.tsx

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Check if the environment variable is defined, otherwise throw an error
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error("Stripe public key is not defined in environment variables.");
}

// Initialize Stripe with the public key
const stripePromise = loadStripe(stripePublicKey);

const SubscriptionPage = ({ userEmail }:any) => {
  const handleSubscription = async (priceId: string) => {
    console.log('Redirecting to checkout for:', userEmail);
    const stripe = await stripePromise;

    if (!stripe) {
      console.error("Stripe has not been initialized properly.");
      return;
    }


    // Call your backend to create the Stripe Checkout session
    const response = await fetch('https://7b5we67gn6.execute-api.us-east-1.amazonaws.com/prod/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId, email: userEmail }), // Pass the selected plan and user email
    });

    const { id: sessionId } = await response.json();

    
    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId,
    });

    if (result.error) {
      console.error("Stripe Checkout error:", result.error.message);
    }
  };

  return (
    <div className="subscription-container">
      <h1>Select a Subscription Plan</h1>
      <div className="plans">
        <div className="plan-box" onClick={() => handleSubscription('price_1QBKbpG8jnQLC5SAmZ0CFHhO')}>
          <h2>Monthly</h2>
          <p>$10/month</p>
        </div>
        <div className="plan-box" onClick={() => handleSubscription('price_1QBKcfG8jnQLC5SAUKU11z0u')}>
          <h2>6 Months</h2>
          <p>$50/6 months</p>
        </div>
        <div className="plan-box" onClick={() => handleSubscription('price_1QBKeDG8jnQLC5SA2gOWRfA2')}>
          <h2>1 Year</h2>
          <p>$90/year</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
