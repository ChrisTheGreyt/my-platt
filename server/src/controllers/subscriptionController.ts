// subscriptionController.ts

import Stripe from 'stripe';
import { Request, Response } from 'express';
import dotenv from 'dotenv'

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { priceId, email, username, planType, promotionCode, cognitoId } = req.body;

  if (!priceId || !email || !cognitoId) {
    return res.status(400).json({ error: 'Price ID, email, and Cognito ID are required.' });
  }

  try {
    // Define line item based on the type of purchase
    const lineItems = [
      {
        price: priceId,
        quantity: 1,
      },
    ];

    // Create a new Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: lineItems,
      mode: planType === 'one-time' ? 'payment' : 'subscription', // payment for one-time, subscription for recurring
      discounts: promotionCode ? [{ promotion_code: promotionCode }] : undefined,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscriptions`,
      client_reference_id: cognitoId, // Include Cognito ID for tracking
      metadata: {
        username: username || '', // Include username if available
        planType: planType,
      },
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'An error occurred while creating the checkout session.' });
  }
};
