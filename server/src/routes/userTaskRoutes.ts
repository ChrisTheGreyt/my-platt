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
              subscriptionStatus: true,
          },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (user.subscriptionStatus !== 'active') {
        return res.status(403).json({ error: 'Subscription inactive' });
      }

      // Send both userId and selectedTrack
      res.json({
          userId: user.userId,
          selectedTrack: user.selectedTrack,
          subscriptionStatus: user.subscriptionStatus,
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
        "2026": [101, 200],
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
  
  router.get('/users/:userId/projects', async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
  
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }
  
    try {
      const trackProjectRanges = {
        "2025": [1, 12],
        "2026": [101, 112],
      } as const;
  
      // Fetch the user's selectedTrack
      const user = await prisma.user.findUnique({
        where: { userId: userId },
        select: { selectedTrack: true },
      });
  
      if (!user || !user.selectedTrack) {
        return res.status(400).json({ error: "User or selected track not found" });
      }
  
      const selectedTrack = user.selectedTrack as keyof typeof trackProjectRanges;
  
      if (!trackProjectRanges[selectedTrack]) {
        return res.status(400).json({ error: "Invalid selectedTrack" });
      }
  
      const [startProjectId, endProjectId] = trackProjectRanges[selectedTrack];
  
      // Fetch projects within the range
      const projects = await prisma.project.findMany({
        where: {
          id: {
            gte: startProjectId,
            lte: endProjectId,
          },
        },
      });
  
      res.json(projects);
    } catch (error) {
      console.error(`Error fetching projects for userId ${userId}:`, error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  router.get('/users/details', async (req, res) => {
    const cognitoId = req.headers.authorization?.split(' ')[1];
  
    if (!cognitoId) {
      return res.status(400).json({ error: "Authorization header missing or invalid" });
    }
  
    try {
      const user = await prisma.user.findUnique({
        where: { cognitoId },
        select: { userId: true, selectedTrack: true },
      });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json(user); // Ensure valid JSON response
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  });
  
  router.get('/users/:cognitoId/projects', async (req, res) => {
    const cognitoId = req.params.cognitoId;
  
    try {
      const user = await prisma.user.findUnique({
        where: { cognitoId },
        select: { selectedTrack: true },
      });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Fetch projects with id between 101 and 200
      const projects = await prisma.project.findMany({
        where: {
          id: {
            gte: 101, // Greater than or equal to 101
            lte: 200, // Less than or equal to 200
          },
        },
      });
  
      res.json({ projects });
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });
  
  

export default router;
