import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import AWS from "aws-sdk";

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
