import { Router } from "express";
import { createProject, getProjects, getTimeGatedProjects } from "../controllers/projectController";

const router = Router();

router.get("/", getProjects);
router.post("/", createProject);
router.get("/time-gated", getTimeGatedProjects);

export default router;
