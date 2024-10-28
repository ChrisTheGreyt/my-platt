import { Router } from "express";
import { logSubscription } from "../controllers/subscriptionController";

const router = Router();

router.post("/log-subscription", logSubscription);

export default router;
