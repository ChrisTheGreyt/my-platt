import { Router } from "express";
import { getUser, getUsers, postUser, checkSubscriptionStatus, handleStripeWebhook } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.post("/", postUser);
router.get("/:cognitoId", getUser);
router.post("/check-subscription", checkSubscriptionStatus);
router.post("/webhook", handleStripeWebhook);

export default router;
