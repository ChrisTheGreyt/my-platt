import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: Number(projectId),
      },
      include: {
        author: true,
        assignee: true,
        comments: true, // Correct field name
        attachments: true,
      },
    });
    res.json(tasks);
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    res.status(500).json({ message: `Error retrieving tasks: ${err.message}` });
  }
};


export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    points,
    projectId,
    authorUserId,
    assignedUserId,
  } = req.body;

  console.log("Incoming Task Payload:", req.body); // Log full payload

try {
  console.log("Processing task creation...");
  const newTask = await prisma.task.create({
    data: {
      title,
      description,
      status,
      priority,
      tags,
      startDate: new Date(startDate).toISOString(), // Explicitly enforce ISO-8601
      dueDate: new Date(dueDate).toISOString(),     // Explicitly enforce ISO-8601
      points: points ?? 0,
      projectId: Number(projectId),
      authorUserId: Number(authorUserId),
      assignedUserId: assignedUserId ? Number(assignedUserId) : null,
    },
  });
  console.log("Task created successfully:", newTask);
  res.status(201).json(newTask);
} catch (error: any) {
  console.error("Error during task creation:", error);
  res.status(500).json({ message: `Error creating task: ${error.message}` });
}
};


export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        status: status,
      },
    });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const { taskId } = req.params;
  const { title, description, tags, startDate, dueDate, points, priority, status } = req.body;

  console.log(`Incoming Update Request for Task ID: ${taskId}`);
  console.log("Request Body:", req.body); // Log incoming request data

  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        title,
        description,
        tags,
        startDate: startDate ? new Date(startDate) : null, // Convert string to Date
        dueDate: dueDate ? new Date(dueDate) : null, // Convert string to Date
        points: points || 0, // Fallback to 0 if undefined
        priority,
        status,
      },
    });

    console.log("Task updated successfully:", updatedTask); // Log success
    res.json(updatedTask);
  } catch (error: any) {
    console.error(`Error updating task: ${error.message}`);
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};


export const getUserTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
        ],
      },
      include: {
        author: true,
        assignee: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user's tasks: ${error.message}` });
  }
};


export const getTimeGatedTasks = async (req: Request, res: Response): Promise<void> => {
  const { userId, track } = req.query;

  if (!userId || !track) {
    res.status(400).json({ message: "Missing required query parameters" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { cognitoId: String(userId) },
      select: { createdAt: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const is2025Track = track === "2025";
    const startId = is2025Track ? 1 : 101;
    const endId = is2025Track ? 100 : 200;

    const userJoinDate = new Date(user.createdAt);
    const now = new Date();

    // Calculate months difference (January to February = 1 month difference)
    const monthsDiff = (now.getFullYear() - userJoinDate.getFullYear()) * 12 
      + (now.getMonth() - userJoinDate.getMonth());
    
    // Add 1 to include the current month (so 1 month diff + 1 = 2 months access)
    const accessibleMonths = monthsDiff + 1;

    console.log({
      userCreatedAt: user.createdAt,
      currentDate: now.toISOString(),
      monthsDiff,
      accessibleMonths
    });

    // Calculate project range
    const projectEnd = Math.min(startId + accessibleMonths - 1, endId);

    const tasks = await prisma.task.findMany({
      where: {
        projectId: {
          gte: startId,
          lte: projectEnd
        },
      },
      orderBy: { dueDate: "asc" },
    });

    console.log('Access calculation:', {
      joinDate: userJoinDate.toISOString(),
      currentDate: now.toISOString(),
      monthsAccess: accessibleMonths,
      projectRange: {
        start: startId,
        end: projectEnd,
        numberOfMonths: projectEnd - startId + 1
      }
    });

    res.status(200).json(tasks);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error fetching time-gated tasks:", message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const updateUserTaskStatus = async (
  req: Request<{}, {}, { userId: string; taskId: string; status: string }>,
  res: Response
): Promise<void> => {
  const { userId, taskId, status } = req.body;

  if (!userId || !taskId || !status) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const updatedTask = await prisma.task.update({
      where: { id: Number(taskId) },
      data: { status },
    });

    res.json(updatedTask);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error updating task status:", message);
    res.status(500).json({ message: `Error updating task status: ${message}` });
  }
};

export const createSchoolTasks = async (req: Request, res: Response): Promise<void> => {
  const { userId, schoolTaskId, status, position } = req.body;

  try {
    const newTask = await prisma.userTasks.create({
      data: {
        userId: Number(userId),
        schoolTaskId: Number(schoolTaskId),
        taskId: null,
        status,
        position,
      },
    });

    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    console.error("❌ Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

export const updateTaskStatusAndPosition = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status, position, userId } = req.body;

  try {
    const updatedTask = await prisma.userTasks.update({
      where: {
        unique_user_task: {
          userId: Number(userId),
          taskId: Number(taskId)
        }
      },
      data: {
        status,
        position
      },
      include: {
        task: true
      }
    });

    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};

