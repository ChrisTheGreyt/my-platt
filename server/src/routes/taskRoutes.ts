import { Router } from "express";
import {
  createTask,
  getTasks,
  getTimeGatedTasks,
  getUserTasks,
  updateTask,
  updateTaskStatus,
  updateUserTaskStatus,
} from "../controllers/taskController";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:taskId/status", updateTaskStatus);
router.get("/user/:userId", getUserTasks);
router.patch('/:taskId', updateTask);
router.patch("/user-tasks", updateUserTaskStatus); 
router.get("/time-gated", getTimeGatedTasks);
router.patch("/:taskId/status", updateTaskStatus);



export default router;
