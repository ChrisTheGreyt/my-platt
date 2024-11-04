// subscriptionRoutes.ts

import express from 'express';
import { createCheckoutSession } from '../controllers/subscriptionController';

const router = express.Router();

// Route for creating Stripe checkout session
router.post('/create-checkout-session', createCheckoutSession);

export default router;
