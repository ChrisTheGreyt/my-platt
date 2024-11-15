// src/routes/userRoutes.ts

import { Router, Request, Response } from "express";
import { 
  getUser, 
  getUsers, 
  checkSubscriptionStatus, 
  handleStripeWebhook, 
  fetchSessionData, 
  updateUserStatus, 
  updateAfterPayment,
  updateUserAfterPayment,
  checkUserStatus
} from "../controllers/userController";
import { body, validationResult } from 'express-validator'; // Use named imports

const router = Router();

// Middleware for validation
const validateUpdateAfterPayment = [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('profilePictureUrl').optional().isURL().withMessage('Invalid URL for profile picture'),
];

// Route Definitions
router.get("/", getUsers);
router.get("/:cognitoId", getUser);
router.post("/check-subscription", checkSubscriptionStatus);
router.post("/webhook", handleStripeWebhook);
router.get("/fetch-session", fetchSessionData);
router.post('/update-user-status', updateUserStatus);
router.post('/check-status', checkUserStatus);
router.post('/update-after-payment', validateUpdateAfterPayment, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  updateAfterPayment(req, res);
});

export default router;
