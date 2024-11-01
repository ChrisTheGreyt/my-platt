import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Ensure the environment variable is set
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const checkSubscriptionStatus = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    // Retrieve the customer based on email
    const customers = await stripe.customers.list({ email });
    if (customers.data.length === 0) {
      return res.json({ hasSubscription: false });
    }

    const customerId = customers.data[0].id;

    // Retrieve subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });

    const hasSubscription = subscriptions.data.length > 0;
    return res.json({ hasSubscription });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return res.status(500).json({ error: 'Failed to check subscription status' });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving users: ${error.message}` });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        cognitoId: cognitoId,
      },
    });

    res.json(user);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user: ${error.message}` });
  }
};

export const postUser = async (req: Request, res: Response) => {
  try {
    const {
      username,
      cognitoId,
      email,
      profilePictureUrl = "i1.jpg",
      teamId = 1,
    } = req.body;
    const newUser = await prisma.user.create({
      data: {
        username,
        cognitoId,
        email,
        profilePictureUrl,
        teamId,
      },
    });
    res.json({ message: "User Created Successfully", newUser });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving users: ${error.message}` });
  }
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers['stripe-signature'] as string;

  try {
    const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_details?.email;

      if (customerEmail) {
        // Update the subscription status of the user
        await prisma.user.update({
          where: { email: customerEmail },
          data: { subscriptionStatus: 'active' },
        });
        console.log("User subscription status updated to active.");
      }
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};


export const fetchSessionData = async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.session_id as string;
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json(session);
  } catch (error) {
    console.error("Error fetching session data:", error);
    res.status(500).json({ error: "Failed to fetch session data" });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { cognitoId, status } = req.body;

    if (!cognitoId || !status) {
      return res.status(400).json({ message: 'Missing cognitoId or status' });
    }

    // Update the user's status in the database
    const updatedUser = await prisma.user.update({
      where: { cognitoId: cognitoId },
      data: { subscriptionStatus: status },
    });

    return res.status(200).json({ message: 'User status updated successfully', user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { cognitoId, username, email } = req.body;

  try {
    // Use Prisma to insert the user into the database
    const newUser = await prisma.user.create({
      data: {
        cognitoId,
        username,
        email,
      },
    });

    // Send back success response
    res.status(201).json({
      message: 'User created successfully.',
      user: newUser,
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({
      message: 'An error occurred while creating the user in the database.',
      error: error.message,
    });
  }
};