import { Router } from "express";

import { getUser, getUsers, postUser, checkSubscriptionStatus } from "../controllers/userController";

const router = Router();

router.get("/", getUsers);
router.post("/", postUser);
router.get("/:cognitoId", getUser);
router.post('/check-subscription', checkSubscriptionStatus);

export default router;
