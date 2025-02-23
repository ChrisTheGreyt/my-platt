import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
      };
    }
  }
}



export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (token) {
        console.log("Authorization token provided.");
        // Use type assertion to bypass type restrictions:
        (req as any).user = { token };
      } else {
        console.warn("Authorization header provided, but token is missing.");
      }
    } else {
      console.warn("No Authorization header provided. Proceeding unauthenticated.");
    }
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    next();
  }
};



// Middleware to verify task ownership or allow creation
export const verifyTaskOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const userId = req.user?.userId || 1; // Temporarily using userId 1 for testing

    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    // Check if this is a school task
    const schoolTask = await prisma.schoolTasks.findUnique({
      where: { id: taskId },
      include: {
        userTasks: {
          where: { userId: userId }
        }
      }
    });

    if (!schoolTask) {
      return res.status(404).json({ error: 'School task not found' });
    }

    // If there's no existing userTask, that's okay - we'll create one
    // If there is one, make sure it belongs to the current user
    if (schoolTask.userTasks.length > 0 && schoolTask.userTasks[0].userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to modify this task' });
    }

    next();
  } catch (error) {
    console.error('Task ownership verification error:', error);
    res.status(500).json({ error: 'Failed to verify task ownership' });
  }
};
