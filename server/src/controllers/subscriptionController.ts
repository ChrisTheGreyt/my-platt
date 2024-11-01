import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const cognito = new AWS.CognitoIdentityServiceProvider();

export const logSubscription = async (req: Request, res: Response) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerEmail = session.customer_details?.email;

    if (!customerEmail) {
      return res.status(400).json({ error: "No email associated with session" });
    }

    // Update database with subscription status
    await prisma.user.update({
      where: { email: customerEmail },
      data: { subscriptionStatus: "active" },
    });

    // Update Cognito user attributes
    const user = await cognito.adminGetUser({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: customerEmail,
    }).promise();

    if (user) {
      await cognito.adminUpdateUserAttributes({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: customerEmail,
        UserAttributes: [{ Name: "custom:subscriptionStatus", Value: "active" }],
      }).promise();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error logging subscription:", error);
    res.status(500).json({ error: "Failed to log subscription" });
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { email, username } = req.body;
  let mode;
    // if (planType === 'monthly') {
    //   mode = 'subscription';  // Recurring subscription
    // } else {
    //   mode = 'payment';  // One-time payment
    // }

  try {
    // Create a new customer or retrieve existing one
    let customer = (await stripe.customers.list({ email })).data[0];

    if (!customer) {
      customer = await stripe.customers.create({
        email,
        metadata: {
          username,
        },
      });
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: 'price_XXXXXXXXXXXXXX', // Replace with your actual price ID
          quantity: 1,
        },
      ],
      customer: customer.id,
      success_url: `${process.env.CLIENT_ORIGIN}/payment-success`,
      cancel_url: `${process.env.CLIENT_ORIGIN}/payment-cancelled`,
    });

    res.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'An error occurred while creating the checkout session.', error: error.message });
  }
};

// exports.handler = async (event) => {
//   try {
//     const { email, priceId, planType } = JSON.parse(event.body);

//     let mode;
//     if (planType === 'monthly') {
//       mode = 'subscription';  // Recurring subscription
//     } else {
//       mode = 'payment';  // One-time payment
//     }

//     // Create the Stripe Checkout session with promotion code support
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       customer_email: email,
//       line_items: [
//         {
//           price: priceId,  // Use the actual priceId sent from the frontend
//           quantity: 1,
//         },
//       ],
//       mode,
//       allow_promotion_codes: true,  // This enables the coupon field in Stripe Checkout
//       success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CLIENT_URL}/cancel`,
//     });

//     return {
//       statusCode: 200,
//       headers: {
//         "Access-Control-Allow-Origin": "https://main.d249lhj5v2utjs.amplifyapp.com",
//         "Access-Control-Allow-Credentials": true,
//         "Access-Control-Allow-Headers": "Content-Type",
//         "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
//       },
//       body: JSON.stringify({ id: session.id }),
//     };
//   } catch (error) {
//     return {
//       statusCode: 400,
//       headers: {
//         "Access-Control-Allow-Origin": "https://main.d249lhj5v2utjs.amplifyapp.com",
//         "Access-Control-Allow-Credentials": true,
//         "Access-Control-Allow-Headers": "Content-Type",
//         "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
//       },
//       body: JSON.stringify({ error: error.message }),
//     };
//   }
// };