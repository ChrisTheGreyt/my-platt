import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Check if the environment variable is defined, otherwise throw an error
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error("Stripe public key is not defined in environment variables.");
}

// Initialize Stripe with the public key
const stripePromise = loadStripe(stripePublicKey);

const SubscriptionPage = ({ userEmail }: any) => {
  const handleSubscription = async (priceId: string, planType: string) => {
    console.log('Redirecting to checkout for:', userEmail);
    const stripe = await stripePromise;

    if (!stripe) {
      console.error("Stripe has not been initialized properly.");
      return;
    }

    try {
      // Call your backend to create the Stripe Checkout session
      const response = await fetch('https://7b5we67gn6.execute-api.us-east-1.amazonaws.com/prod/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, email: userEmail, planType }), // Pass the selected plan and user email
      });

      const data = await response.json();
      console.log('Response from server:', data); // Check for sessionId and errors
      const { id: sessionId } = data;

      if (!sessionId) {
        console.error('No sessionId returned from the server.');
        return;
      }

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId,
      });

      if (result.error) {
        console.error("Stripe Checkout error:", result.error.message);
      }
    } catch (error) {
      console.error('Error during the checkout process:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Select a Subscription Plan</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Monthly Plan */}
          <div
            className="relative bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-2xl transition-transform transform hover:scale-105"
            onClick={() => handleSubscription('price_1QBKbpG8jnQLC5SAmZ0CFHhO', 'monthly')}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-400 rounded-t-lg"></div> {/* Silver Bar */}
            <h2 className="text-2xl font-semibold mt-2">MyPLATT Monthly</h2>
            <p className="mt-2 text-gray-600">$75 / Monthly</p>
            <p className="mt-2 text-sm text-gray-500">Access to all features for 30 days.</p>
          </div>

          {/* 6-Month Plan */}
          <div
            className="relative bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-2xl transition-transform transform hover:scale-105"
            onClick={() => handleSubscription('price_1QBKcfG8jnQLC5SAUKU11z0u', 'oneTime')}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-t-lg"></div> {/* Blue Bar */}
            <h2 className="text-2xl font-semibold mt-2">MyPLATT 6 Months</h2>
            <p className="mt-2 text-gray-600">$400 / 6 Months</p>
            <p className="mt-2 text-sm text-gray-500">Save with a 6-month subscription.</p>
          </div>

          {/* Yearly Plan */}
          <div
            className="relative bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-2xl transition-transform transform hover:scale-105"
            onClick={() => handleSubscription('price_1QBKeDG8jnQLC5SA2gOWRfA2', 'oneTime')}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 rounded-t-lg"></div> {/* Gold Bar */}
            <h2 className="text-2xl font-semibold mt-2">MyPLATT Yearly</h2>
            <p className="mt-2 text-gray-600">$800 / Yearly</p>
            <p className="mt-2 text-sm text-gray-500">Best value with a yearly subscription.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
