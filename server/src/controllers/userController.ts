import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { differenceInMonths } from "date-fns";
import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import Stripe from "stripe";
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const verifyStripeSession_ = async (sessionId: string): Promise<Stripe.Checkout.Session | null> => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Stripe session retrieval failed:', error);
    return null;
  }
};

const verifyStripeSession = async (sessionId: string): Promise<Stripe.Checkout.Session | null> => {
  if (sessionId === 'test_session_id') {
    // Mock session for testing
    return {
      id: sessionId,
      payment_status: 'paid',
      client_reference_id: 'test_cognito_id',
    } as Stripe.Checkout.Session;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Stripe session retrieval failed:', error);
    return null;
  }
};


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

export const postUser = async (req: Request, res: Response) =>{

  try{ 
    const {
      firstName,
      lastName,
      email,
      username,
      cognitoId,
      profilePictureUrl = "https://main.d249lhj5v2utjs.amplifyapp.com/pd1.jpg",
      teamId = 1,
      subscriptionStatus,
    } = req.body;
    const newUser = await prisma.user.create({
      data: {
        cognitoId,
        username,
        email, // Ensure this is included
        firstName, // Ensure this is included
        lastName, // Ensure this is included
        profilePictureUrl: profilePictureUrl || "https://default.url/picture.jpg", // Optional
        teamId: teamId || 1, // Optional
        subscriptionStatus: "inactive", // Optional
      },
    });
    res.json({ mesage: "User Created Successfully", newUser});
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
  const sessionId = req.query.session_id as string;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required.' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const cognitoId = session.client_reference_id;

    if (!cognitoId) {
      return res.status(400).json({ error: 'Cognito ID not found in session.' });
    }

    res.status(200).json({ cognitoId });
  } catch (error) {
    console.error('Error fetching session data:', error);
    res.status(500).json({ error: 'Failed to fetch session data.' });
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
  const { cognitoId, username, email, firstName, lastName, profilePictureUrl, teamId, subscriptionStatus } = req.body;

  try {
    console.log('Incoming Request Body:', req.body);

    // Validate required fields
    if (!cognitoId || !username || !email || !firstName || !lastName) {
      console.error('Validation Error: Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Attempting to create user with:', {
      cognitoId,
      username,
      email,
      firstName,
      lastName,
      profilePictureUrl,
      teamId,
      subscriptionStatus,
    });

     
    const newUser = await prisma.user.create({
      data: {
          cognitoId,
          username,
          email,
          firstName,
          lastName,
          profilePictureUrl: profilePictureUrl || "https://default.url/picture.jpg",
          teamId: teamId || 1,
          subscriptionStatus: subscriptionStatus || "inactive",
      },
  });
  console.log("User created successfully:", newUser);
  return res.status(200).json({
      message: "User created successfully",
      data: newUser,
  });
} catch (error: any) {
  console.log("Error while creating user:", error);

  if (error.code === "P2002") {
      console.log("Duplicate entry error:", error.meta);
      return res.status(400).json({
          message: "User with this email or username already exists.",
      });
  }

  if (error.code === "P2003") {
      console.log("Foreign key constraint error:", error.meta);
      return res.status(400).json({
          message: "Invalid foreign key: teamId might not exist.",
      });
  }

  return res.status(500).json({
      message: error.toString(),
      details: error.toString(),
  });
}
};




// export const updateUserAfterPayment = async (req: Request, res: Response) => {
//   try {
//     const { sessionId, firstName, lastName, username, profilePictureUrl } = req.body;
//     const session = await stripe.checkout.sessions.retrieve(sessionId);
//     const customerEmail = session.customer_details?.email;
//     const defaultProfilePictureUrl = 'https://main.d249lhj5v2utjs.amplifyapp.com/pd1.jpg';
//     if (!sessionId || !firstName || !lastName || !username) {
//       return res.status(400).json({ message: 'Missing required fields' });
//     }

//     const user = await prisma.user.create({
//       data: {
//         email: customerEmail,
//         cognitoId: sessionId,
//         firstName,
//         lastName,
//         profilePictureUrl: profilePictureUrl || defaultProfilePictureUrl,
//         subscriptionStatus: 'active',
//         username,
//       },
//     });

//     res.status(200).json({ success: true, user });
//   } catch (error) {
//     console.error('Error creating user:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const updateUserAfterPayment__ = async (req: Request, res: Response) => {
//   const { sessionId, firstName, lastName, profilePictureUrl, username } = req.body;

//   if (!sessionId || !firstName || !lastName || !username) {
//     return res.status(400).json({ error: 'Session ID, first name, last name, and username are required.' });
//   }

//   try {
//     const session = await stripe.checkout.sessions.retrieve(sessionId);
//     const customerEmail = session.customer_details?.email;

//     if (!customerEmail) {
//       return res.status(400).json({ error: 'Customer email not found in session.' });
//     }

//     const defaultProfilePictureUrl = 'https://main.d249lhj5v2utjs.amplifyapp.com/pd1.jpg'; // Replace with your actual default image URL

//     let user = await prisma.user.findUnique({ where: { email: customerEmail } });

//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           email: customerEmail,
//           cognitoId: sessionId,
//           firstName,
//           lastName,
//           profilePictureUrl: profilePictureUrl || defaultProfilePictureUrl,
//           subscriptionStatus: 'active',
//           username,
//         },
//       });
//     } else {
//       user = await prisma.user.update({
//         where: { email: customerEmail },
//         data: {
//           firstName,
//           lastName,
//           profilePictureUrl: profilePictureUrl || defaultProfilePictureUrl,
//           subscriptionStatus: 'active',
//         },
//       });
//     }

//     res.status(200).json({ success: true, user });
//   } catch (error) {
//     console.error('Error updating user after payment:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };


export const checkUserStatus = async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log('Received request for /check-status with email:', email);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { subscriptionStatus: true },
    });

    if (user) {
      console.log('User found:', user);
      return res.status(200).json({ subscriptionStatus: user.subscriptionStatus });
    } else {
      console.log('User not found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error checking subscription status:', email, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const checkUserStatusByCognitoId = async (req: Request, res: Response) => {
  console.log('Body received:', req.body); // Log received body

  const { cognitoId } = req.body;

  if (!cognitoId) {
    console.error('Missing cognitoId in request body.');
    return res.status(400).json({ error: 'Missing cognitoId' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { cognitoId },
      select: { subscriptionStatus: true },
    });

    if (user) {
      console.log('User found:', user);
      return res.status(200).json({ subscriptionStatus: user.subscriptionStatus });
    } else {
      console.error('User not found for cognitoId:', cognitoId);
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error checking subscription status by cognitoId:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};




export const createFreshUser = async (req: Request, res: Response) => {
  try {
    const { cognitoId, username, email, firstName, lastName, teamId, profilePictureUrl, subscriptionStatus } = req.body;

    // Validate required fields
    if (!cognitoId || !username || !email || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create the user in the database
    const newUser = await prisma.user.create({
      data: {
        username,             // Ensure this is present in the request
        cognitoId,            // Ensure this is present in the request
        profilePictureUrl: profilePictureUrl || "https://default.url/picture.jpg", // Optional with default
        teamId,               // Ensure this is present in the request
        email,                // Ensure this is present in the request
        firstName,            // Ensure this is present in the request
        lastName,             // Ensure this is present in the request
        subscriptionStatus: subscriptionStatus || "inactive", // Optional with default
      },
    });

    return res.status(201).json({
      message: "User created successfully.",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resolve = async (req: Request, res: Response) => {
  const { cognitoSub } = req.query;

  if (!cognitoSub) {
    return res.status(400).json({ error: 'Missing cognitoSub' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { cognitoId: String(cognitoSub) },
      select: {
        userId: true,
        selectedTrack: true,
        subscriptionStatus: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        profilePictureUrl: true,
        cognitoId: true,
        teamId: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.subscriptionStatus !== 'active') {
      return res.status(403).json({ error: 'Subscription inactive' });
    }

    res.json({
      userId: user.userId,
      selectedTrack: user.selectedTrack,
      subscriptionStatus: user.subscriptionStatus,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePictureUrl: user.profilePictureUrl,
      cognitoId: user.cognitoId,
      teamId: user.teamId,
    });
  } catch (error) {
    console.error('Error resolving userId:', error);
    res.status(500).json({ error: 'Failed to resolve userId' });
  }
};




export const getUserTrack = async (req: Request, res: Response) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { userId: Number(userId) },
      select: { selectedTrack: true }, // Include selectedTrack
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ selectedTrack: user.selectedTrack });
  } catch (error) {
    console.error("Error fetching user track:", error);
    res.status(500).json({ error: "Failed to fetch user track" });
  }
};


export const updateUserTrack = async (req: Request, res: Response) => {
  const { userId, selectedTrack } = req.body;

  if (!userId || !selectedTrack) {
    return res.status(400).json({ error: "Missing userId or selectedTrack" });
  }

  try {
    const user = await prisma.user.update({
      where: { userId: Number(userId) },
      data: { selectedTrack },
    });

    res.json({ selectedTrack: user.selectedTrack });
  } catch (error) {
    console.error("Error updating user track:", error);
    res.status(500).json({ error: "Failed to update user track" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { userId, selectedTrack } = req.body;
  console.log("Updating user with data:", { userId, selectedTrack });
  try {
    const user = await prisma.user.update({
      where: { userId },
      data: { selectedTrack },
    });
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};


export const getDetails = async (req:Request, res:Response) => {
  const cognitoId = req.headers.authorization?.split(' ')[1];

  if (!cognitoId) {
    console.error("Missing cognitoId in Authorization header.");
    return res.status(400).json({ error: "Authorization header missing or invalid" });
  }

  try {
    console.log("Fetching user for cognitoId:", cognitoId);
    const user = await prisma.user.findUnique({
      where: { cognitoId },
      select: { userId: true, selectedTrack: true },
    });

    if (!user) {
      console.error("No user found for cognitoId:", cognitoId);
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
};

export const getProjects = async (req:Request, res:Response) => {
  const cognitoId = req.params.cognitoId;

  try {
    const user = await prisma.user.findUnique({
      where: { cognitoId },
      select: { selectedTrack: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const trackProjectRanges: Record<string, [number, number]> = {
      "2025": [1, 12],
      "2026": [101, 112],
    };

    if (!user.selectedTrack) {
      return res.status(400).json({ error: "User does not have a valid selectedTrack" });
    }

    const [startProjectId, endProjectId] = trackProjectRanges[user.selectedTrack] || [];
    if (!startProjectId || !endProjectId) {
      return res.status(400).json({ error: "Invalid selectedTrack" });
    }

    const projects = await prisma.project.findMany({
      where: {
        id: {
          gte: startProjectId,
          lte: endProjectId,
        },
      },
    });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};


// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.MP_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.MP_ACCESS_KEY_ID!,
    secretAccessKey: process.env.MP_SECRET_ACCESS_KEY!,
  },
});

export const getUserCreatedTime = async (req: Request, res: Response) => {
  try {
    // Extract the username from query parameters
    const username = req.query.username as string;
    console.log("Username received:", username);

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    // Query AWS Cognito directly using the username
    const command = new AdminGetUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
      Username: username,
    });

    const response = await cognitoClient.send(command);
    console.log("Cognito Response:", JSON.stringify(response, null, 2));

    // Fetch the creation time (UserCreateDate) directly from Cognito
    const createdTime = response.UserCreateDate; // Default Cognito created time
    console.log("Extracted Created Time:", createdTime);

    if (!createdTime) {
      return res.status(404).json({ error: "Created time not found in Cognito" });
    }

    // Return the creation time in ISO format
    res.json({ createdTime });
  } catch (error: any) {
    console.error("Error fetching created time:", error);
    res.status(500).json({ error: error.message });
  }
};

