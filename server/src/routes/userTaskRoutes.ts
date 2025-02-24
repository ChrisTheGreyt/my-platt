import express from 'express';
import { PrismaClient } from "@prisma/client";// Update the path if needed to your Prisma client


const router = express.Router();
const prisma = new PrismaClient();

// Add this at the top of the file, after imports
const corsMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://main.d249lhj5v2utjs.amplifyapp.com',
    'http://localhost:3000'
  ];

  // Always log the incoming request details
  console.log('Incoming request:', {
    origin,
    method: req.method,
    path: req.path,
    headers: req.headers
  });

  // Always send Vary header
  res.header('Vary', 'Origin');

  // Check if origin is in our allowed list
  if (origin && allowedOrigins.includes(origin)) {
    // Send back the specific origin that made the request
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', [
      'Content-Type',
      'Authorization',
      'X-Api-Key',
      'X-Amz-Date',
      'X-Amz-Security-Token'
    ].join(','));
    
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
  }

  next();
};

// Apply the middleware to all routes
router.use(corsMiddleware);

// Add at the top of the file
type UserWithSubscription = {
  userId: number;
  selectedTrack: string;
  subscriptionStatus: string | null;
};

// Define your routes below
router.get('/users/resolve', async (req, res) => {
  try {
    const { cognitoSub } = req.query;
    console.log('Resolving user for cognitoSub:', cognitoSub);

    if (!cognitoSub) {
      console.log('Missing cognitoSub parameter');
      return res.status(400).json({ error: 'Missing cognitoSub' });
    }

    // Modify the Promise.race call
    const user = (await Promise.race([
      prisma.user.findUnique({
        where: { cognitoId: String(cognitoSub) },
        select: {
          userId: true,
          selectedTrack: true,
          subscriptionStatus: true,
        },
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )
    ])) as UserWithSubscription | null;

    if (!user) {
      console.log('User not found for cognitoSub:', cognitoSub);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', user);

    // Skip subscription check if status is 'active' or 'Active'
    const status = user.subscriptionStatus?.toLowerCase() || '';
    if (status !== 'active') {
      console.log('User subscription status:', user.subscriptionStatus);
      return res.json({
        userId: user.userId,
        selectedTrack: user.selectedTrack,
        subscriptionStatus: user.subscriptionStatus,
      });
    }

    // Send both userId and selectedTrack
    res.json({
      userId: user.userId,
      selectedTrack: user.selectedTrack,
      subscriptionStatus: user.subscriptionStatus,
    });
  } catch (error) {
    console.error('Error resolving user:', error);
    
    // Send a more detailed error response
    res.status(500).json({ 
      error: 'Failed to resolve user details',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/tasks/board-view-tasks', async (req, res) => {
  const { userId, projectId } = req.query;
  console.log("Received userId:", userId);
  console.log("Received projectId:", projectId);

  try {
    console.log("Query Parameters:", { userId, projectId });

    // Fetch user-specific tasks
    const userTasks = await prisma.userTasks.findMany({
      where: {
        userId: Number(userId), // ✅ Only fetch tasks for the current user
        taskId: { not: null }, // ✅ Ensure only project tasks are fetched
        task: {
          projectId: Number(projectId) // ✅ Ensure tasks belong to the specified project
        }
      },
      include: {
        task: true,  // ✅ Fetch task details
      }
    });

    console.log("UserTasks Response:", userTasks);
    if (userTasks) {
      userTasks.forEach((task, index) => {
        console.log(`Task ${index}:`, task);
      });
    }

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

router.get('/tasks/user-tasks', async (req, res) => {
  const { userId, projectId } = req.query;
  console.log("Received userId:", userId);
  console.log("Received projectId:", projectId);

  try {
    // Fetch user-specific tasks
    const userTasks = await prisma.userTasks.findMany({
      where: {
        userId: Number(userId),// ✅ Only fetch tasks for the current user
        schoolTaskId: { not: null } // ✅ Ensure only school tasks are fetched
      },
      include: {
        schoolTask: true,  // ✅ Fetch school task details
      }
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

    // Check if the task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(taskId) },
    });

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
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

    // Bulk insert into userTasks
    const userTaskData = tasks.map((task) => ({
      userId,
      taskId: task.id,
      status: task.status || 'To Do', // Default status
      priority: task.priority || 'Medium', // Default priority
    }));

    await prisma.userTasks.createMany({ data: userTaskData, skipDuplicates: true });

    res.json({ message: "userTasks initialized successfully", userTaskData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to initialize userTasks" });
  }
});

router.get('/users/:userId/projects', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  console.log(`🔍 Fetching projects for userId: ${userId}`);

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid userId" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { selectedTrack: true },
    });

    console.log("🟢 User found:", user);

    if (!user || !user.selectedTrack) {
      console.error("❌ User or selected track not found");
      return res.status(400).json({ error: "User or selected track not found" });
    }

    const trackProjectRanges = {
      "2025": [1, 12],
      "2026": [101, 112],
    } as const;

    const selectedTrack = user.selectedTrack as keyof typeof trackProjectRanges;
    console.log(` Selected track: ${selectedTrack}`);

    if (!trackProjectRanges[selectedTrack]) {
      console.error("❌ Invalid selectedTrack");
      return res.status(400).json({ error: "Invalid selectedTrack" });
    }

    const [startProjectId, endProjectId] = trackProjectRanges[selectedTrack];

    const projects = await prisma.project.findMany({
      where: {
        id: {
          gte: startProjectId,
          lte: endProjectId,
        },
      },
    });

    console.log(`✅ Returning ${projects.length} projects`);
    res.json(projects);
  } catch (error) {
    console.error(`🔥 Error fetching projects for userId ${userId}:`, error);
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

router.get('/tasks/time-gated', async (req, res) => {
  const { userId, track } = req.query;

  if (!userId || !track) {
    return res.status(400).json({ error: 'Missing userId or track' });
  }

  try {
    console.log("🔍 Checking user with ID:", userId, "and track:", track);

    // ✅ Step 1: Fetch User Details
    const user = await prisma.user.findUnique({
      where: { userId: Number(userId) },
      select: { userId: true, selectedTrack: true },
    });

    if (!user?.selectedTrack || !user?.userId) {
      console.error(`❌ User ${userId} not found or missing track info.`);
      return res.status(404).json({ error: 'User not found or missing track info' });
    }

    console.log(`✅ User ${userId} found. Selected track: ${user.selectedTrack}`);

    // ✅ Step 2: Fetch Tasks with Debugging
    const tasks = await prisma.userTasks.findMany({
      where: {
        userId: user.userId, // Ensure this matches the correct table case
      },
      orderBy: { taskId: 'asc' },
      include: {
        task: true, // Ensure task details are included
      },
    });

    console.log(`✅ Found ${tasks.length} tasks for user ${userId}.`);
    console.log("📝 Task Data:", JSON.stringify(tasks, null, 2));

    if (tasks.length === 0) {
      console.warn(`⚠️ No tasks found for user ${userId}. Check database entries.`);
    }

    // ✅ Step 3: Send Response
    res.json(tasks.map(ut => ({
      ...ut.task,
      position: ut.position
    })));
  } catch (error) {
    console.error('🔥 Error fetching time-gated tasks:', error);
    res.status(500).json({ error: 'Failed to fetch time-gated tasks' });
  }
});

// Update task status and position for project tasks
router.put('/tasks/:taskId/status-position', async (req, res) => {
  const { taskId } = req.params;
  const { status, position, userId } = req.body;

  try {
    console.log('📝 Updating task:', { taskId, status, position, userId });
    
    const updatedTask = await prisma.userTasks.update({
      where: {
        unique_user_task: {
          userId: Number(userId),
          taskId: Number(taskId)
        }
      },
      data: { status, position },
      include: { task: true }
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.get('/users/:userId/time-gated-projects', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get user's creation date
    const user = await prisma.user.findUnique({
      where: { userId: Number(userId) },
      select: { createdAt: true, selectedTrack: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userJoinDate = new Date(user.createdAt);
    const now = new Date();
    
    // Calculate accessible months
    const monthsDiff = (now.getFullYear() - userJoinDate.getFullYear()) * 12 
      + (now.getMonth() - userJoinDate.getMonth());
    const accessibleMonths = monthsDiff + 1;

    // Determine project range based on track
    const is2025Track = user.selectedTrack === "2025";
    const startId = is2025Track ? 1 : 101;
    const endId = Math.min(startId + accessibleMonths - 1, is2025Track ? 100 : 200);

    // Fetch only accessible projects
    const projects = await prisma.project.findMany({
      where: {
        id: {
          gte: startId,
          lte: endId,
        },
      },
      orderBy: { id: 'asc' },
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching time-gated projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

export default router;
