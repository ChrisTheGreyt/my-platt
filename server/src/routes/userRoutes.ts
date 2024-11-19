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
  updateAfterPayment,
  updateUserAfterPayment,
  createFreshUser,
  checkUserStatus
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
router.post("/check-subscription", checkSubscriptionStatus);
router.post("/webhook", handleStripeWebhook);
router.get("/fetch-session", fetchSessionData);
router.post('/update-user-status', updateUserStatus);
router.post('/create-user', createUser);
router.post('/check-status', checkUserStatus);
router.post('/users/update-after-payment', validateUpdateAfterPayment, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  updateAfterPayment(req, res);
});
router.post("/api/create-user", createFreshUser);

export default router;
