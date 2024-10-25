import React, { useEffect, useState } from 'react';
import { Authenticator } from "@aws-amplify/ui-react";
import { loadStripe } from '@stripe/stripe-js';
import { Amplify } from 'aws-amplify';
import { Hub } from '@aws-amplify/core';
import "@aws-amplify/ui-react/styles.css";

// Initialize Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || "",
    }
  }
});

// Check if the environment variable is defined, otherwise throw an error
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error("Stripe public key is not defined in environment variables.");
}

// Initialize Stripe with the public key
const stripePromise = loadStripe(stripePublicKey);

const formFields = {
  signUp: {
    username: {
      order: 1,
      Placeholder: "Choose a username",
      label: "Username",
      inputProps: { required: true },
    },
    email: {
      order: 2,
      Placeholder: "Enter your email address",
      label: "Email",
      inputProps: { type: "email", required: true },
    },
    password: {
      order: 3,
      Placeholder: "Enter your password",
      label: "Password",
      inputProps: { type: "password", required: true },
    },
    confirm_password: {
      order: 4,
      Placeholder: "Confirm your password",
      label: "Confirm Password",
      inputProps: { type: "password", required: true },
    },
  }
};

const AuthProvider = ({ children }: any) => {
  const [selectedPlan, setSelectedPlan] = useState('');

  // Function to handle the Stripe redirection
  const redirectToCheckout = async (email: string) => {
    console.log('Redirecting to checkout for:', email);
    const stripe = await stripePromise;

    if (!stripe) {
      console.error("Stripe has not been initialized properly.");
      return;
    }

    // Make sure the user has selected a plan
    if (!selectedPlan) {
      alert("Please select a subscription plan.");
      return;
    }

    // Send selected plan to the backend to create the Stripe Checkout session
    const response = await fetch('https://7b5we67gn6.execute-api.us-east-1.amazonaws.com/prod/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId: selectedPlan, email }),  // Include selected priceId
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

  useEffect(() => {
    const authListener = (data: any) => {
      const { event, data: eventData } = data.payload;
      if (event === 'signIn' && eventData) {
        console.log('User signed in:', eventData);
        // Trigger Stripe checkout after successful sign-in
        redirectToCheckout(eventData.attributes.email);
      }
    };

    const listener = Hub.listen('auth', authListener);

    return () => {
      listener();  // Clean up the listener
    };
  }, [selectedPlan]);

  return (
    <div>
      <Authenticator formFields={formFields}>
        {({ user }: any) =>
          user ? (
            <div>
              {/* Subscription Plan Selection */}
              <h1>Select a Subscription Plan</h1>
              <div>
                <label>
                  <input
                    type="radio"
                    value="price_1QBKbpG8jnQLC5SAmZ0CFHhO" // Monthly
                    checked={selectedPlan === 'price_1QBKbpG8jnQLC5SAmZ0CFHhO'}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                  />
                  Monthly Plan
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    value="price_1QBKcfG8jnQLC5SAUKU11z0u" // 6-Month
                    checked={selectedPlan === 'price_1QBKcfG8jnQLC5SAUKU11z0u'}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                  />
                  6-Month Plan
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    value="price_1QBKeDG8jnQLC5SA2gOWRfA2" // 1-Year
                    checked={selectedPlan === 'price_1QBKeDG8jnQLC5SA2gOWRfA2'}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                  />
                  1-Year Plan
                </label>
              </div>
              {children}
            </div>
          ) : (
            <div>
              <h1>Please sign in below:</h1>
            </div>
          )
        }
      </Authenticator>
    </div>
  );
};

export default AuthProvider;
