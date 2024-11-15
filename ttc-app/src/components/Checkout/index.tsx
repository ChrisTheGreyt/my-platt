import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
//DEV NOTE: This page is no longer in use and only being used as reference

// Load your Stripe public key
// Check if the environment variable is defined, otherwise throw an error
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error("Stripe public key is not defined in environment variables.");
}

// Initialize Stripe with the public key
const stripePromise = loadStripe(stripePublicKey);
const CheckoutComponent = () => {
  const [selectedPlan, setSelectedPlan] = useState('');

  const handleCheckout = async () => {
    if (!selectedPlan) {
      alert('Please select a plan');
      return;
    }

    const stripe = await stripePromise;
  
    if (!stripe) {
      console.error("Stripe has not been initialized properly.");
      return;
    }

    // Call your backend (Lambda function) to create the Stripe Checkout session
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/create-checkout-session`, {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId: selectedPlan }), // Send selected priceId to backend
    });

    const { id: sessionId } = await response.json();
    console.log('Session ID:', sessionId);
  
    const result = await stripe.redirectToCheckout({
      sessionId,
    });
  
    if (result.error) {
      console.error("Stripe Checkout error:", result.error.message);
    }
  };

  return (
    <div>
      <h1>Select a Subscription Plan</h1>
      <div>
        {/* Radio buttons for plan selection */}
        <label>
          <input 
            type="radio" 
            value="price_1QBKbpG8jnQLC5SAmZ0CFHhO" 
            checked={selectedPlan === 'price_1QBKbpG8jnQLC5SAmZ0CFHhO'} 
            onChange={(e) => setSelectedPlan(e.target.value)} 
          />
          Monthly Plan
        </label>
        <br />
        <label>
          <input 
            type="radio" 
            value="price_1QBKcfG8jnQLC5SAUKU11z0u" 
            checked={selectedPlan === 'price_1QBKcfG8jnQLC5SAUKU11z0u'} 
            onChange={(e) => setSelectedPlan(e.target.value)} 
          />
          6-Month Plan
        </label>
        <br />
        <label>
          <input 
            type="radio" 
            value="price_1QBKeDG8jnQLC5SA2gOWRfA2" 
            checked={selectedPlan === 'price_1QBKeDG8jnQLC5SA2gOWRfA2'} 
            onChange={(e) => setSelectedPlan(e.target.value)} 
          />
          1-Year Plan
        </label>
      </div>
      <button onClick={handleCheckout}>Proceed to Checkout</button>
    </div>
  );
};

export default CheckoutComponent;
