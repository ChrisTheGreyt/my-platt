import { Router } from "express";
import {
  createSchoolTasks,
  createTask,
  getTasks,
  getUserTasks,
  updateTask,
  updateTaskStatus,
  updateTaskStatusAndPosition,
} from "../controllers/taskController";

const router = Router();

router.get("/", getTasks);
router.post("/", createTask);
router.get("/user/:userId", getUserTasks);
router.patch('/:taskId', updateTask);
router.patch("/:taskId/status", updateTaskStatus);
router.put("/:taskId/status-position", updateTaskStatusAndPosition);
router.post("/tasks/create", createSchoolTasks);


export default router;
