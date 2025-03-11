// src/components/SubscriptionPage/index.tsx

"use client"; // Client Component

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import Head from 'next/head';

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
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>('');
  const [promoCodeMessage, setPromoCodeMessage] = useState<{text: string, type: 'success' | 'error' | 'info' | null}>({text: '', type: null});
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

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

  const handleApplyPromoCode = () => {
    if (!promotionCode.trim()) {
      setPromoCodeMessage({text: 'Please enter a promotion code', type: 'error'});
      return;
    }

    // Basic validation - promo codes are typically alphanumeric
    const cleanedCode = promotionCode.trim().toUpperCase();
    if (!/^[A-Z0-9]+$/.test(cleanedCode)) {
      setPromoCodeMessage({text: 'Promotion code should only contain letters and numbers', type: 'error'});
      return;
    }

    setLoading(true);
    
    // Here you would typically validate the promo code with your backend
    // For now, we'll simulate a successful application after a short delay
    setTimeout(() => {
      setAppliedPromoCode(cleanedCode);
      setPromoCodeMessage({text: 'Promotion code applied successfully!', type: 'success'});
      setLoading(false);
    }, 500);
    
    // Uncomment and adapt this code when you have a backend endpoint for promo code validation
    /*
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/validate-promo-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        promotionCode: cleanedCode,
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.valid) {
        setAppliedPromoCode(cleanedCode);
        setPromoCodeMessage({text: 'Promotion code applied successfully!', type: 'success'});
      } else {
        setPromoCodeMessage({text: data.message || 'Invalid promotion code', type: 'error'});
      }
    })
    .catch(err => {
      console.error('Error validating promotion code:', err);
      setPromoCodeMessage({text: 'Error validating promotion code', type: 'error'});
    })
    .finally(() => {
      setLoading(false);
    });
    */
  };

  const clearPromoCode = () => {
    setPromotionCode('');
    setAppliedPromoCode('');
    setPromoCodeMessage({text: 'Promotion code removed', type: 'info'});
  };

  const handleSubscription = async (priceId: string, planType: string, planName: string) => {
    console.log("email:", email);
    console.log("username:", username);
    console.log("priceId:", priceId);
    console.log("planType:", planType);
    console.log("promotionCode:", appliedPromoCode);
    
    setSelectedPlan(planName);
  
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
      // Prepare the request body - only include promotionCode if it exists
      const requestBody: any = {
        priceId,
        email,
        username,
        planType,
      };
      
      // Only add the promotion code if it's not empty
      // Using couponCode instead of promotionCode to avoid conflict with allow_promotion_codes
      if (appliedPromoCode && appliedPromoCode.trim() !== '') {
        requestBody.couponCode = appliedPromoCode.trim();
      }
      
      console.log("Request body:", requestBody);
      
      // Call the backend to create a Stripe Checkout session
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      // Check if the response is ok before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        
        // Handle specific error for promotion code
        if (errorText.includes('promotion_code') || errorText.toLowerCase().includes('promo') || 
            errorText.toLowerCase().includes('coupon') || errorText.toLowerCase().includes('discount')) {
          setError('Invalid promotion code. Please check and try again.');
          setLoading(false);
          return;
        } else {
          throw new Error(`Server error: ${response.status} ${errorText}`);
        }
      }
      
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
    <>
      <Head>
        <title>MyPLATT Subscription</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              Choose Your <span className="text-indigo-600">MyPLATT</span> Plan
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the subscription that best fits your needs and start organizing your law school applications today.
            </p>
          </div>
          
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
              <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email ?? ""}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Select a Plan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly Plan */}
                <div 
                  className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${selectedPlan === 'monthly' ? 'border-indigo-500 bg-indigo-50 transform scale-[1.02]' : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'}`}
                  onClick={() => !loading && handleSubscription('price_1R1I1bG8jnQLC5SA6rlMiau2', 'subscription', 'monthly')}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                  <div className="p-6 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Monthly Plan</h3>
                        <p className="mt-1 text-sm text-gray-500">Flexible subscription</p>
                      </div>
                      <div className="bg-indigo-100 rounded-full p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <span className="text-3xl font-extrabold text-gray-900">$37</span>
                      <span className="text-base font-medium text-gray-500"> / month</span>
                    </div>
                    
                    <ul className="mt-6 space-y-3">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Full access to all features</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Cancel anytime</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">30 days of access</span>
                      </li>
                    </ul>
                    
                    <button 
                      className={`mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                      disabled={loading}
                    >
                      {loading && selectedPlan === 'monthly' ? 'Processing...' : 'Select Monthly Plan'}
                    </button>
                  </div>
                </div>

                {/* Yearly Plan */}
                <div 
                  className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${selectedPlan === 'yearly' ? 'border-indigo-500 bg-indigo-50 transform scale-[1.02]' : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'}`}
                  onClick={() => !loading && handleSubscription('price_1QxFkoG8jnQLC5SABmUMgR9A', 'subscription', 'yearly')}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
                  <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    BEST VALUE
                  </div>
                  <div className="p-6 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Yearly Plan</h3>
                        <p className="mt-1 text-sm text-gray-500">Best value option</p>
                      </div>
                      <div className="bg-yellow-100 rounded-full p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <span className="text-3xl font-extrabold text-gray-900">$335</span>
                      <span className="text-base font-medium text-gray-500"> / year</span>
                    </div>
                    
                    <ul className="mt-6 space-y-3">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Full access to all features</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Full year of access</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Save 20%</span>
                      </li>
                    </ul>
                    
                    <button 
                      className={`mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                      disabled={loading}
                    >
                      {loading && selectedPlan === 'yearly' ? 'Processing...' : 'Select Yearly Plan'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Promotion code */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label htmlFor="promotionCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Have a Promotion Code?
                </label>
                <div className="flex">
                  <input
                    id="promotionCode"
                    type="text"
                    value={promotionCode}
                    onChange={(e) => {
                      setPromotionCode(e.target.value);
                      // Clear any message when user starts typing again
                      if (promoCodeMessage.text) {
                        setPromoCodeMessage({text: '', type: null});
                      }
                    }}
                    placeholder="Enter your code"
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={loading || appliedPromoCode !== ''}
                  />
                  {appliedPromoCode ? (
                    <button
                      type="button"
                      onClick={clearPromoCode}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      disabled={loading}
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyPromoCode}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      disabled={!promotionCode.trim() || loading}
                    >
                      {loading && !selectedPlan ? 'Applying...' : 'Apply'}
                    </button>
                  )}
                </div>
                {promoCodeMessage.text && (
                  <p className={`mt-2 text-sm ${
                    promoCodeMessage.type === 'success' ? 'text-green-600' : 
                    promoCodeMessage.type === 'error' ? 'text-red-600' : 
                    'text-gray-500'
                  }`}>
                    {promoCodeMessage.text}
                  </p>
                )}
                {appliedPromoCode && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-green-700">
                        Code <span className="font-medium">{appliedPromoCode}</span> will be applied at checkout
                      </p>
                    </div>
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Enter your promotion code to receive a discount on your subscription. The discount will be applied during checkout.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>By subscribing, you agree to our <a href="https://toppingthecurve.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">Terms of Service and Privacy Policy</a>.</p>
            <p className="mt-2">Questions? Contact our support team at contact@toppingthecurve.com</p>
          </div>
          
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-center space-x-4">
                  <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-lg font-medium text-gray-900">Processing your subscription...</p>
                </div>
                <p className="mt-4 text-sm text-gray-500 text-center">Please don't close this window.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SubscriptionPage;
