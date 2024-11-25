import express from 'express';
import { PrismaClient } from "@prisma/client";// Update the path if needed to your Prisma client

const router = express.Router();
const prisma = new PrismaClient();

// Define your routes below
router.get('/users/resolve', async (req, res) => {
    try {
      const { cognitoSub } = req.query;
  
      if (!cognitoSub) {
        return res.status(400).json({ error: 'Missing cognitoSub' });
      }
  
      const user = await prisma.user.findUnique({
        where: { cognitoId: String(cognitoSub) },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json({ userId: user.userId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to resolve userId' });
    }
  });
  
  
  
  
  
  

  router.patch('/tasks/user-tasks', async (req, res) => {
    try {
      const { userId, taskId, status } = req.body;
  
      if (!userId || !taskId || !status) {
        return res.status(400).json({ error: "userId, taskId, and status are required" });
      }
  
      const updatedUserTask = await prisma.userTasks.updateMany({
        where: {
          userId: Number(userId),
          taskId: Number(taskId),
        },
        data: { status },
      });
  
      if (updatedUserTask.count === 0) {
        return res.status(404).json({ error: "UserTask not found" });
      }
  
      res.json({ message: "Task status updated successfully", updatedUserTask });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update task status" });
    }
  });

  router.post('/tasks/user-tasks', async (req, res) => {
    try {
      const { userId, taskId } = req.body;
  
      if (!userId || !taskId) {
        return res.status(400).json({ error: "userId and taskId are required" });
      }
  
      const existingUserTask = await prisma.userTasks.findUnique({
        where: {
          userId_taskId: {
            userId: Number(userId),
            taskId: Number(taskId),
          },
        },
      });
  
      if (existingUserTask) {
        return res.status(400).json({ error: "UserTask already exists" });
      }
  
      const newUserTask = await prisma.userTasks.create({
        data: {
          userId: Number(userId),
          taskId: Number(taskId),
        },
      });
  
      res.json(newUserTask);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create UserTask" });
    }
  });
  
  

export default router;
