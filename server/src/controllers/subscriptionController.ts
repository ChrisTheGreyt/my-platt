// subscriptionController.ts

import Stripe from 'stripe';
import { Request, Response } from 'express';
import dotenv from 'dotenv'

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { priceId, email, username, planType, promotionCode } = req.body;

  if (!priceId || !email) {
    return res.status(400).json({ error: 'Price ID and email are required.' });
  }

  try {
    const lineItems = [
      {
        price: priceId,
        quantity: 1,
      },
    ];

    const mode = planType === 'subscription' ? 'subscription' : 'payment';


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: lineItems,
      mode, //planType === 'one-time' ? 'payment' : 'subscription',
      discounts: promotionCode ? [{ promotion_code: promotionCode }] : undefined,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}&username=${encodeURIComponent(username)}`,
      cancel_url: `${process.env.CLIENT_URL}/subscriptions`,
      metadata: {
        username: username || '',
        planType: planType,
      },
      
    });
    console.log({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: lineItems,
      mode,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}&username=${encodeURIComponent(username)}`,
      cancel_url: `${process.env.CLIENT_URL}/subscriptions`,
      metadata: {
        username: username || '',
        planType: planType,
      },
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'An error occurred while creating the checkout session.' });
  }
};

