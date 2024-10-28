import React, { useEffect, useState } from 'react';
import { Authenticator } from "@aws-amplify/ui-react";
import { loadStripe } from '@stripe/stripe-js';
import { Amplify } from 'aws-amplify';
import { Hub } from '@aws-amplify/core';
import "@aws-amplify/ui-react/styles.css";
import SubscriptionPage from '@/components/SubscriptionPage';

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
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);  // Store the authenticated user

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
        setAuthenticatedUser(eventData);  // Store the authenticated user data
      }
    };

    const listener = Hub.listen('auth', authListener);

    return () => {
      listener();  // Clean up the listener
    };
  }, []);

  const handleProceedToCheckout = () => {
    if (authenticatedUser && authenticatedUser.attributes.email) {
      redirectToCheckout(authenticatedUser.attributes.email);
    } else {
      console.error("User not authenticated or email not available.");
    }
  };

  return (
    <Authenticator formFields={formFields}>
      {({ user }: any) =>
        user ? (
          <div>{children}</div>
        ) : (
          <div>
            <h1>Please sign in below:</h1>
          </div>
        )
      }
    </Authenticator>
  );
};

export default AuthProvider;
