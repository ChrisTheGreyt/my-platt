import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const projects = await prisma.project.findMany();
    res.json(projects);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving projects: ${error.message}` });
  }
};

export const createProject = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { name, description, startDate, endDate, trackOption } = req.body;

  try {
    const idRange = trackOption === "2025" ? [1, 12] : [101, 112];

    const existingProjects = await prisma.project.findMany({
      where: {
        id: {
          gte: idRange[0],
          lte: idRange[1],
        },
      },
      orderBy: { id: "asc" },
    });

    const existingIds = existingProjects.map((project) => project.id);
    let nextId = idRange[0];

    while (existingIds.includes(nextId) && nextId <= idRange[1]) {
      nextId++;
    }

    if (nextId > idRange[1]) {
      return res
        .status(400)
        .json({ message: "No available project IDs for this track" });
    }

    const newProject = await prisma.project.create({
      data: {
        id: nextId,
        name,
        description,
        startDate,
        endDate,
      },
    });

    return res.status(201).json(newProject);
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: `Error creating a project: ${error.message}` });
  }
};


// Get time-gated projects
export const getTimeGatedProjects = async (req: Request, res: Response) => {
  const { userId } = req.query; // User ID from query params

  try {
    // Fetch user data to get createdAt
    const user = await prisma.user.findUnique({
      where: { userId: Number(userId) },
      select: { createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate how many months have passed since the user joined
    const userJoinDate = new Date(user.createdAt);
    const now = new Date();
    const monthsSinceJoined =
      (now.getFullYear() - userJoinDate.getFullYear()) * 12 +
      now.getMonth() -
      userJoinDate.getMonth() +
      1; // Add 1 to include the first month

    console.log(`Months since joined: ${monthsSinceJoined}`);

    // Determine track based on project ID ranges
    const is2025Track = Number(userId) <= 100; // IDs <= 100 are 2025
    const startId = is2025Track ? 1 : 101;
    const endId = is2025Track ? 100 : 200;

    // Fetch projects within ID range and limit based on elapsed months
    const projects = await prisma.project.findMany({
      where: {
        id: {
          gte: startId,
          lte: Math.min(startId + monthsSinceJoined - 1, endId), // Limit based on months
        },
      },
      orderBy: {
        id: "asc", // Order projects by ID
      },
    });

    console.log("Filtered Projects:", projects);

    return res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching time-gated projects:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};