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

      // Query the user by cognitoSub (cognitoId in your schema)
      const user = await prisma.user.findUnique({
          where: { cognitoId: String(cognitoSub) },
          select: {
              userId: true,
              selectedTrack: true, // Include selectedTrack in the response
          },
      });

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Send both userId and selectedTrack
      res.json({
          userId: user.userId,
          selectedTrack: user.selectedTrack,
      });
  } catch (error) {
      console.error('Error resolving user:', error);
      res.status(500).json({ error: 'Failed to resolve user details' });
  }
});

  
  
  
  // Add the GET route
  router.get('/tasks/user-tasks', async (req, res) => {
    const { userId, projectId } = req.query;
  
    try {
      // Fetch user-specific tasks
      const userTasks = await prisma.userTasks.findMany({
        where: {
          userId: Number(userId),
          task: {
            projectId: Number(projectId),
          },
        },
        include: {
          task: true, // Include task details
        },
      });
  
      // If no user-specific tasks are found, fall back to default tasks
      if (userTasks.length === 0) {
        const defaultTasks = await prisma.task.findMany({
          where: {
            projectId: Number(projectId),
          },
        });
        return res.json(defaultTasks);
      }
  
      res.json(userTasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch user tasks" });
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
  
  router.post('/tasks/user-tasks/setup', async (req, res) => {
    const { userId, selectedTrack } = req.body;
  
    try {
      // Define task ranges for each track
      const trackTaskRanges: { [key: string]: [number, number] } = {
        "2025": [1, 50],
        "2026": [51, 100],
      };
  
      // Get the task range for the selected track
      const [startTaskId, endTaskId] = trackTaskRanges[selectedTrack] || [];
  
      if (!startTaskId || !endTaskId) {
        return res.status(400).json({ error: "Invalid selectedTrack" });
      }
  
      // Get tasks in the range
      const tasks = await prisma.task.findMany({
        where: {
          id: {
            gte: startTaskId,
            lte: endTaskId,
          },
        },
      });
  
      // Bulk insert into UserTasks
      const userTaskData = tasks.map((task) => ({
        userId,
        taskId: task.id,
        status: task.status || 'To Do', // Default status
        priority: task.priority || 'Medium', // Default priority
      }));
  
      await prisma.userTasks.createMany({ data: userTaskData, skipDuplicates: true });
  
      res.json({ message: "UserTasks initialized successfully", userTaskData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to initialize UserTasks" });
    }
  });
  

export default router;
