import { Router } from "express";
import { getUser, getUsers, postUser, createUser, checkSubscriptionStatus, handleStripeWebhook, fetchSessionData, updateUserStatus } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.post("/", postUser);
router.get("/:cognitoId", getUser);
router.post("/check-subscription", checkSubscriptionStatus);
router.post("/webhook", handleStripeWebhook);
router.get("/fetch-session", fetchSessionData);
router.post('/create', createUser);
router.post('/update-user-status', updateUserStatus);

export default router;
