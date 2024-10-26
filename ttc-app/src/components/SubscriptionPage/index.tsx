import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';

// Check if the environment variable is defined, otherwise throw an error
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error("Stripe public key is not defined in environment variables.");
}

// Initialize Stripe with the public key
const stripePromise = loadStripe(stripePublicKey);

// Pass `userEmail` prop into the SubscriptionPage
const SubscriptionPage = ({ userEmail }: { userEmail: string }) => {
  const router = useRouter();

  // Check for subscription status on page load
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!userEmail) return;

      try {
        const response = await fetch('https://7b5we67gn6.execute-api.us-east-1.amazonaws.com/prod/check-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail }),
        });
        
        const data = await response.json();
        if (data.hasSubscription) {
          router.push('/app'); // Redirect to main app if user has an active subscription
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    };

    checkSubscriptionStatus();
  }, [userEmail, router]);

  // Handle subscription initiation
  const handleSubscription = async (priceId: string, planType: string) => {
    const stripe = await stripePromise;

    if (!stripe) {
      console.error("Stripe has not been initialized properly.");
      return;
    }

    try {
      // Create Stripe Checkout session
      const response = await fetch('https://7b5we67gn6.execute-api.us-east-1.amazonaws.com/prod/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, email: userEmail, planType }),
      });

      const data = await response.json();
      const { id: sessionId } = data;

      if (!sessionId) {
        console.error('No sessionId returned from the server.');
        return;
      }

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        console.error("Stripe Checkout error:", result.error.message);
      }
    } catch (error) {
      console.error('Error during the checkout process:', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      <h1 className="text-2xl font-semibold mb-4">Select a Subscription Plan</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 border rounded-lg shadow-lg">
          <div className="h-2 bg-gray-300 rounded-t-md mb-4"></div>
          <h2 className="text-lg font-bold">MyPLATT Monthly</h2>
          <p className="text-gray-600">$75 / Monthly</p>
          <button
            onClick={() => handleSubscription('price_1QBKbpG8jnQLC5SAmZ0CFHhO', 'monthly')}
            className="mt-4 px-4 py-2 bg-gray-300 text-gray-900 rounded"
          >
            Choose Monthly
          </button>
        </div>
        <div className="p-6 border rounded-lg shadow-lg">
          <div className="h-2 bg-blue-500 rounded-t-md mb-4"></div>
          <h2 className="text-lg font-bold">MyPLATT 6 months</h2>
          <p className="text-gray-600">$400 / 6 Months</p>
          <button
            onClick={() => handleSubscription('price_1QBKcfG8jnQLC5SAUKU11z0u', 'halfYear')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Choose 6 Months
          </button>
        </div>
        <div className="p-6 border rounded-lg shadow-lg">
          <div className="h-2 bg-yellow-500 rounded-t-md mb-4"></div>
          <h2 className="text-lg font-bold">MyPLATT Yearly</h2>
          <p className="text-gray-600">$800 / Year</p>
          <button
            onClick={() => handleSubscription('price_1QBKeDG8jnQLC5SA2gOWRfA2', 'yearly')}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Choose Yearly
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
