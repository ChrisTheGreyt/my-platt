// src/routes/userRoutes.ts

import { Router, Request, Response } from "express";
import { 
  getUser, 
  getUsers, 
  createUser,
  checkSubscriptionStatus, 
  handleStripeWebhook, 
  fetchSessionData, 
  updateUserStatus, 
  createFreshUser,
  checkUserStatus,
  postUser,
  resolve,
  getUserTrack,
  updateUserTrack,
  updateUser,
  getDetails,
  getProjects,
  checkUserStatusByCognitoId,
  getUserCreatedTime,
} from "../controllers/userController";
import { body, validationResult } from 'express-validator'; // Use named imports

const router = Router();

// Middleware for validation
const validateUpdateAfterPayment = [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('profilePictureUrl')
    .optional()
    .custom((value) => {
      if (value && !/^https?:\/\/.+/.test(value)) {
        throw new Error('Invalid URL for profile picture');
      }
      return true;
    }),
];

// Route Definitions
router.get("/", getUsers);
router.get("/:cognitoId", getUser);
router.post("/", postUser)
router.post("/check-subscription", checkSubscriptionStatus);
router.post("/webhook", handleStripeWebhook);
router.get("/fetch-session", fetchSessionData);
router.post('/update-user-status', updateUserStatus);
router.post('/create-user', createUser);
router.post('/check-status', checkUserStatus);
router.patch('/update', updateUser); // Ensure this is defined in userRoutes.ts
router.post('/check-status-by-cognito', (req, res, next) => {
  console.log('Request received at /check-status-by-cognito:', req.body);
  next();
}, checkUserStatusByCognitoId);


router.get('/resolve', resolve);
router.get("/track", getUserTrack);
router.patch("/track", updateUserTrack);
router.get('/details', getDetails );
router.get('/:cognitoId/projects', getProjects);
router.get("/created-time", getUserCreatedTime);
router.patch("/users/update-track", updateUserTrack);
router.patch("/update-track", updateUserTrack);


export default router;
