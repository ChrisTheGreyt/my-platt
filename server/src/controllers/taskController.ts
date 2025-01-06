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
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving tasks: ${error.message}` });
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
