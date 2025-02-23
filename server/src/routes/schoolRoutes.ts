import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

// Get all law schools
router.get('/law-schools', async (req, res) => {
  try {
    const schools = await prisma.law_schools.findMany({
      select: {
        id: true,
        school: true
      }
    });
    
    res.json(schools.map(school => ({
      school_id: school.id.toString(),
      school_name: school.school || ''
    })));
  } catch (error) {
    console.error('Error fetching law schools:', error);
    res.status(500).json({
      error: 'Failed to fetch law schools',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

interface SchoolProgress {
  id: number;
  userId: number;
  school: string;
  isSelected: boolean;
  completionPercentage: number;
  tasksCompleted: number;
  totalTasks: number;
}

// Get schools with completion percentage
router.get('/user/:userId/schools', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    let schoolsToProcess = [];
    
    if (userId === 0) {
      // Default schools for unauthenticated users
      const defaultSchoolNames = ['Harvard Law School', 'Yale Law School', 'Stanford Law School'];
      const defaultSchools = await prisma.law_schools.findMany({
        where: {
          school: {
            in: defaultSchoolNames
          }
        }
      });
      schoolsToProcess = defaultSchools.map(school => ({
        id: school.id,
        userId: 0,
        school: school.school || '',
        isSelected: false
      }));
    } else {
      // Get user's schools
      schoolsToProcess = await prisma.userSchool.findMany({
        where: { userId },
        select: { id: true, userId: true, school: true, isSelected: true } // ✅ Added userId
      });      
    }

    // Calculate completion percentage for each school
    const schoolsWithProgress: SchoolProgress[] = await Promise.all(
      schoolsToProcess.map(async (schoolInfo): Promise<SchoolProgress> => {
        // Find the law school and its tasks
        const schoolData = await prisma.law_schools.findFirst({
          where: {
            school: schoolInfo.school
          },
          include: {
            schoolTasks: {
              include: {
                userTasks: userId === 0 ? undefined : {
                  where: {
                    userId
                  },
                  orderBy: {
                    position: 'desc'
                  }
                }
              }
            }
          }
        });

        if (!schoolData) {
          return {
            id: schoolInfo.id,
            userId: schoolInfo.userId,
            school: schoolInfo.school,
            isSelected: schoolInfo.isSelected,
            completionPercentage: 0,
            tasksCompleted: 0,
            totalTasks: 0
          };
        }

        // Count all tasks
        const totalTasks = schoolData.schoolTasks.length;
        // For userId 0, show no completed tasks
        // For authenticated users, count tasks that have completed status
        const completedTasks = userId === 0 ? 0 : schoolData.schoolTasks.filter(task => {
          // Check if the task has any user tasks
          if (!task.userTasks.length) return false;
          // Get the latest user task (first one since we ordered by position desc)
          const latestTask = task.userTasks[0];
          // Check if the task is completed
          return latestTask.status === 'Completed' || latestTask.status === 'completed';
        }).length;
      
        return {
          id: schoolInfo.id,
          userId: schoolInfo.userId,
          school: schoolData.school || schoolInfo.school,
          isSelected: schoolInfo.isSelected,
          completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          tasksCompleted: completedTasks,
          totalTasks: totalTasks
        };
      })
    );

    res.json(schoolsWithProgress);
  } catch (error) {
    console.error('Error fetching user schools:', error);
    res.status(500).json({
      error: 'Failed to fetch user schools',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get school details by name
router.get('/name/:schoolName', async (req, res) => {
  try {
    const schoolName = decodeURIComponent(req.params.schoolName);
    console.log('Looking up school:', schoolName);

    const school = await prisma.law_schools.findFirst({
      where: {
        school: {
          equals: schoolName,
          mode: 'insensitive'
        }
      },
      include: {
        schoolTasks: {
          include: {
            userTasks: {
              orderBy: {
                position: 'asc'
              }
            }
          }
        }
      }
    });

    if (!school) {
      const allSchools = await prisma.law_schools.findMany({
        select: { school: true }
      });
      return res.status(404).json({
        error: 'School not found',
        message: `School "${schoolName}" could not be found. Available schools: ${allSchools.map(s => s.school).join(', ')}`
      });
    }

    res.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({
      error: 'Failed to fetch school details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// get school by id
router.get('/schools/:name', async (req, res) => {
  const { name } = req.params;
  const { userId } = req.query; // ✅ Accept userId from query params

  try {
    const school = await prisma.law_schools.findFirst({
      where: { school: name },
      include: {
        schoolTasks: {
          include: {
            userTasks: {
              where: { userId: Number(userId) }, // ✅ Only fetch user-specific tasks
              orderBy: { position: 'desc' },
            },
          },
        },
      },
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ error: 'Failed to fetch school details' });
  }
});

router.get("/schools/name/:schoolName", async (req, res) => {
  const schoolName = decodeURIComponent(req.params.schoolName);
  const userId = req.query.userId;

  console.log("Looking up school:", schoolName, "for user:", userId);

  try {
    let school = await prisma.law_schools.findFirst({
      where: { 
        school: {
          equals: schoolName,
          mode: 'insensitive'
        }
      },
      include: {
        schoolTasks: {
          include: {
            userSchoolTasks: userId ? {
              where: {
                userId: Number(userId)
              }
            } : true
          }
        }
      }
    });

    if (!school) {
      console.log(`❌ No school found for "${schoolName}"`);
      return res.status(404).json({ error: "School not found" });
    }

    // If no user tasks exist yet, create them
    if (userId && school.schoolTasks.some(task => task.userSchoolTasks.length === 0)) {
      await Promise.all(
        school.schoolTasks.map(task =>
          prisma.userSchoolTasks.upsert({
            where: {
              unique_user_school_task: {
                userId: Number(userId),
                schoolTaskId: task.id
              }
            },
            create: {
              userId: Number(userId),
              schoolTaskId: task.id,
              status: 'todo',
              priority: 'Medium',
              position: 0
            },
            update: {} // Don't update if exists
          })
        )
      );

      // Refetch school with new user tasks
      const updatedSchool = await prisma.law_schools.findFirst({
        where: { school: schoolName },
        include: {
          schoolTasks: {
            include: {
              userSchoolTasks: {
                where: {
                  userId: Number(userId)
                }
              }
            }
          }
        }
      });

      if (!updatedSchool) {
        throw new Error("Failed to refetch school after creating tasks");
      }

      school = updatedSchool;
    }

    console.log("✅ Found school with user-specific tasks:", school);
    res.json(school);
  } catch (error) {
    console.error("🔥 Error fetching school:", error);
    res.status(500).json({ error: "Failed to retrieve school data" });
  }
});


// Update school task status
router.put('/schools/tasks/:schoolTaskId/status', async (req, res) => {
  const { schoolTaskId } = req.params;
  const { status, position, userId } = req.body;

  try {
    console.log(`🔄 Updating task:`, { schoolTaskId, status, position, userId });

    // Normalize the status
    const normalizedStatus = status.toLowerCase()
      .replace(/\s+/g, '_')
      .replace('to_do', 'todo');

    const updatedTask = await prisma.userSchoolTasks.update({
      where: {
        unique_user_school_task: {
          userId: Number(userId),
          schoolTaskId: Number(schoolTaskId)
        }
      },
      data: {
        status: normalizedStatus,
        position: position
      },
      include: {
        schoolTask: true
      }
    });

    console.log('✅ Updated task:', updatedTask);
    res.json(updatedTask);
  } catch (error) {
    console.error('❌ Error updating task:', error);
    res.status(500).json({
      error: 'Failed to update task',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// router.get('/user-school-tasks/:userId', async (req, res) => {
//   const { userId } = req.params;
//   try {
//     console.log(`🔍 Fetching school tasks for user ID: ${userId}`);

//     const schoolTasks = await prisma.userSchoolTasks.findMany({
//       where: {
//         userId: Number(userId)
//       },
//       include: {
//         schoolTask: true,
//       },
//     });

//     if (!schoolTasks.length) {
//       return res.status(404).json({ error: "No school tasks found for this user." });
//     }

//     console.log("✅ Fetched school tasks:", schoolTasks);
//     res.json(schoolTasks);
//   } catch (error) {
//     console.error("❌ Error fetching school tasks:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });



// Update school task status // OUTDATED!!!!
router.put('/tasks/:taskId/status', authenticateUser, async (req, res) => {
  const schoolTaskId = parseInt(req.params.taskId, 10);
  const userId = req.user?.userId || 1; // Temporarily using userId 1 for testing
  const { status, position } = req.body;

  // Normalize status to proper case
  const normalizedStatus = (() => {
    switch (status?.toLowerCase()) {
      case 'to do': return 'To Do';
      case 'in progress': return 'In Progress';
      case 'under review': return 'Under Review';
      case 'completed': return 'Completed';
      default: return status;
    }
  })();

  if (!normalizedStatus || !['To Do', 'In Progress', 'Under Review', 'Completed'].includes(normalizedStatus)) {
    return res.status(400).json({
      error: 'Invalid status. Must be one of: To Do, In Progress, Under Review, Completed'
    });
  }

  try {
    // Start a transaction to handle position updates
    const result = await prisma.$transaction(async (tx) => {
      // Get or create UserTask
      let userTask = await tx.userTasks.findFirst({
        where: {
          schoolTaskId: schoolTaskId,
          userId: userId
        }
      });

      if (!userTask) {
        // Get max position for the target status
        const maxPosition = await tx.$queryRaw<Array<{ max_pos: number }>>`
          SELECT COALESCE(MAX(position), -1) as max_pos
          FROM "UserTasks"
          WHERE "userId" = ${userId}
          AND status = ${normalizedStatus}
          AND "schoolTaskId" IS NOT NULL
        `;

        const newPosition = typeof position === 'number' ? position : maxPosition[0].max_pos + 1;

        // Create new UserTask with the correct position
        userTask = await tx.userTasks.create({
          data: {
            userId,
            taskId: 1, // Using the default task ID
            schoolTaskId,
            status: normalizedStatus,
            priority: 'Medium',
            position: newPosition
          }
        });

        // Update positions of other tasks if needed
        if (typeof position === 'number') {
          await tx.$executeRaw`
            UPDATE "UserTasks"
            SET position = position + 1
            WHERE "userId" = ${userId}
            AND status = ${normalizedStatus}
            AND position >= ${position}
            AND id != ${userTask.id}
            AND "schoolTaskId" IS NOT NULL
          `;
        }
      } else {
        // Get max position in target status
        const maxPosition = await tx.$queryRaw<Array<{ max_pos: number }>>`
          SELECT COALESCE(MAX(position), -1) as max_pos
          FROM "UserTasks"
          WHERE "userId" = ${userId}
          AND status = ${normalizedStatus}
          AND "schoolTaskId" IS NOT NULL
        `;

        const newPosition = typeof position === 'number' ? position : maxPosition[0].max_pos + 1;

        // Update positions in a single query
        if (userTask.status !== status) {
          await tx.$executeRaw`
            WITH moved_task AS (
              UPDATE "UserTasks"
              SET status = ${normalizedStatus},
                  position = ${newPosition}
              WHERE id = ${userTask.id}
              RETURNING id
            ),
            update_target AS (
              UPDATE "UserTasks"
              SET position = position + 1
              WHERE "userId" = ${userId}
              AND status = ${normalizedStatus}
              AND position >= ${newPosition}
              AND id != ${userTask.id}
              AND "schoolTaskId" IS NOT NULL
            )
            UPDATE "UserTasks"
            SET position = position - 1
            WHERE "userId" = ${userId}
            AND status = ${userTask.status}
            AND position > ${userTask.position}
            AND "schoolTaskId" IS NOT NULL
          `;
        } else if (typeof position === 'number' && position !== userTask.position) {
          // Update position within the same status
          await tx.$executeRaw`
            UPDATE "UserTasks"
            SET position = 
              CASE 
                WHEN id = ${userTask.id} THEN ${position}
                WHEN position >= ${Math.min(position, userTask.position)} 
                  AND position <= ${Math.max(position, userTask.position)}
                THEN position + CASE 
                  WHEN ${position} > ${userTask.position} THEN -1
                  ELSE 1
                END
                ELSE position
              END
            WHERE "userId" = ${userId}
            AND status = ${normalizedStatus}
            AND "schoolTaskId" IS NOT NULL
          `;
        }
      }

      // Return updated task with relations and all tasks in the same status
      const [updatedTask, tasksInStatus] = await Promise.all([
        tx.userTasks.findUnique({
          where: { id: userTask.id },
          include: {
            task: true,
            schoolTask: true
          }
        }),
        tx.userTasks.findMany({
          where: {
            userId,
            status: normalizedStatus,
            schoolTaskId: { not: null }
          },
          orderBy: {
            position: 'asc'
          },
          include: {
            task: true,
            schoolTask: true
          }
        })
      ]);

      return {
        updatedTask,
        tasksInStatus
      };
    });

    if (!result.updatedTask) {
      return res.status(404).json({
        error: 'School task not found or not authorized to update'
      });
    }

    return res.json({
      message: 'Task status updated successfully',
      task: result.updatedTask,
      tasksInStatus: result.tasksInStatus
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({
      error: 'Failed to update task',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// Create a new user-school association and generate tasks
router.post('/schools', async (req, res) => {
  const { userId, school } = req.body;
  console.log(`🟢 Creating school tasks for user:`, { userId, school });

  try {
    // Find or create school tasks
    const schoolRecord = await prisma.law_schools.findFirst({
      where: { school },
      include: {
        schoolTasks: true
      }
    });

    if (!schoolRecord) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Create user-specific tasks
    const userSchoolTasks = await Promise.all(
      schoolRecord.schoolTasks.map(task =>
        prisma.userSchoolTasks.create({
          data: {
            userId: Number(userId),
            schoolTaskId: task.id,
            status: 'todo',
            priority: 'Medium',
            position: 0
          }
        })
      )
    );

    console.log(`✅ Created user-specific tasks:`, userSchoolTasks);
    res.json({ message: 'School tasks created successfully' });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Failed to create school tasks' });
  }
});




// Update school task status (only for tasks with a non-null schoolTaskId)
router.put('/schools/tasks/:schoolTaskId/status', async (req, res) => {
  const { schoolTaskId } = req.params;
  const { status, position, userId } = req.body;

  try {
    console.log(`🔄 Updating school task ID ${schoolTaskId} for user ${userId} to status "${status}" at position ${position}`);

    const updatedTask = await prisma.userSchoolTasks.update({
      where: { 
        unique_user_school_task: {
          userId: Number(userId),
          schoolTaskId: Number(schoolTaskId)
        }
      },
      data: { 
        status,
        position 
      },
    });

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Fetch and return the updated task
    const refreshedTask = await prisma.userSchoolTasks.findUnique({
      where: { 
        unique_user_school_task: {
          userId: Number(userId),
          schoolTaskId: Number(schoolTaskId)
        }
      },
      include: { schoolTask: true },
    });

    console.log(`✅ Successfully updated school task:`, refreshedTask);
    res.json(refreshedTask);

  } catch (error) {
    console.error("❌ Error updating school task:", error);
    res.status(500).json({ 
      error: "Failed to update task status",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});


router.get('/schools/:schoolId/tasks/:userId', async (req, res) => {
  const { schoolId, userId } = req.params;

  try {
    const userTasks = await prisma.userTasks.findMany({
      where: {
        schoolTaskId: Number(schoolId),  // ✅ Ensure it filters by schoolTaskId
        userId: Number(userId),         // ✅ Ensure it filters by the logged-in user
      },
      include: {
        schoolTask: true, // ✅ Fetch task details
      },
    });

    res.json(userTasks);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Fetch user tasks for a specific user (only school-based tasks)
router.get('/user-tasks/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    console.log(`🔍 Fetching user tasks for user ID: ${userId}`);

    const userTasks = await prisma.userTasks.findMany({
      where: {
        userId: Number(userId),
        schoolTaskId: { not: null }, // ✅ Ensure only school-related tasks
      },
      include: {
        schoolTask: true, // ✅ Include related school task info
      },
    });

    if (!userTasks.length) {
      return res.status(404).json({ error: "No school tasks found for this user." });
    }

    console.log("✅ Fetched user tasks:", userTasks);
    res.json(userTasks);
  } catch (error) {
    console.error("❌ Error fetching user tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get('/tasks/:schoolTaskId/exists', async (req, res) => {
  const { schoolTaskId } = req.params;
  const { userId } = req.query;

  try {
    const existingTask = await prisma.userTasks.findFirst({
      where: { userId: Number(userId), schoolTaskId: Number(schoolTaskId) },
    });

    res.json({ exists: !!existingTask });
  } catch (error) {
    console.error("❌ Error checking if task exists:", error);
    res.status(500).json({ error: "Failed to check task existence" });
  }
});

router.post('/user-school-tasks', async (req, res) => {
  const { userId, school } = req.body;

  console.log(`🔄 Creating school tasks for user ${userId} and school "${school}"...`);

  if (!userId || !school) {
    return res.status(400).json({ error: 'Missing required fields: userId or school' });
  }

  try {
    // Step 1: Find the school in the `law_schools` table
    const schoolRecord = await prisma.law_schools.findFirst({
      where: { school },
    });

    if (!schoolRecord) {
      console.error(`❌ School "${school}" not found`);
      return res.status(404).json({ error: 'School not found' });
    }
    console.log(`✅ Found school: ${schoolRecord.school}`);

    // Step 2: Get predefined tasks for the selected school
    const schoolTasks = await prisma.schoolTasks.findMany({
      where: { schoolId: schoolRecord.id },
    });

    console.log(`✅ Found ${schoolTasks.length} predefined tasks for "${school}"`);
    console.log("📌 Predefined tasks:", schoolTasks); // 🚀 LOG TASKS BEFORE INSERTING

    if (schoolTasks.length === 0) {
      return res.status(400).json({ error: "No predefined tasks found for this school." });
    }

    // Step 3: Insert tasks into `UserSchoolTasks`
    const userSchoolTasks = schoolTasks.map(task => ({
      userId,
      schoolTaskId: task.id,
      status: 'To Do',
      priority: 'Medium',
      position: 0,
    }));

    console.log("📌 Preparing to insert UserSchoolTasks:", userSchoolTasks);

    const insertedTasks = await prisma.userSchoolTasks.createMany({
      data: userSchoolTasks,
      skipDuplicates: false, // Set to `false` to force insert
    });

    console.log(`✅ Successfully inserted ${insertedTasks.count} tasks into UserSchoolTasks.`);

    res.json({ message: "User school tasks created successfully.", insertedTasks });

  } catch (error) {
    console.error("🔥 Error creating user school tasks:", error);
    res.status(500).json({ error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' });
  }
});



router.get("/user-school-tasks/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const tasks = await prisma.userSchoolTasks.findMany({
      where: { userId },
      include: { schoolTask: true }, // Ensure we include task details
    });

    if (!tasks.length) {
      return res.status(404).json({ error: "No school tasks found for this user." });
    }

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching user-school tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/user-school-tasks', async (req, res) => {
  const { userId, school } = req.body;
  console.log(`🔄 Creating school tasks for user ${userId} and school "${school}"...`);

  if (!userId || !school) {
    return res.status(400).json({ error: 'Missing required fields: userId or school' });
  }

  try {
    // Step 1: Find the school in the database
    const schoolRecord = await prisma.law_schools.findFirst({
      where: { school },
    });

    if (!schoolRecord) {
      console.error(`❌ School "${school}" not found`);
      return res.status(404).json({ error: 'School not found' });
    }
    console.log(`✅ Found school: ${schoolRecord.school} (ID: ${schoolRecord.id})`);

    // Step 2: Get predefined tasks for this school
    const schoolTasks = await prisma.schoolTasks.findMany({
      where: { schoolId: schoolRecord.id },
    });

    console.log(`📌 Found ${schoolTasks.length} predefined tasks for "${school}"`);
    console.log("📝 Predefined school tasks:", schoolTasks);

    if (schoolTasks.length === 0) {
      console.warn("⚠️ No predefined tasks found for this school. Cannot proceed.");
      return res.status(400).json({ error: "No predefined tasks found for this school." });
    }

    // Step 3: Check if user tasks already exist
    const existingUserTasks = await prisma.userSchoolTasks.findMany({
      where: {
        userId: userId,
        schoolTaskId: { in: schoolTasks.map(task => task.id) }, // Ensure we check for existing entries
      },
    });

    if (existingUserTasks.length > 0) {
      console.log("⚠️ User already has tasks assigned for this school.");
      return res.status(409).json({ error: "User already has tasks assigned for this school." });
    }

    // Step 4: Prepare data for insertion
    const userSchoolTasks = schoolTasks.map(task => ({
      userId: userId,
      schoolTaskId: task.id,
      status: 'To Do',
      priority: 'Medium',
      position: 0,
    }));

    console.log("📌 Preparing to insert UserSchoolTasks:", userSchoolTasks);

    // Step 5: Insert tasks into `UserSchoolTasks`
    const insertedTasks = await prisma.userSchoolTasks.createMany({
      data: userSchoolTasks,
      skipDuplicates: true, // Prevent duplicates if rerun
    });

    console.log(`✅ Successfully inserted ${insertedTasks.count} user school tasks.`);

    res.json({
      message: "User school tasks created successfully.",
      tasksInserted: insertedTasks.count,
    });

  } catch (error) {
    console.error("🔥 Error creating user school tasks:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get all schools for a user
router.get('/schools/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userSchools = await prisma.law_schools.findMany({
      where: {
        schoolTasks: {
          some: {
            userSchoolTasks: {
              some: {
                userId: Number(userId)
              }
            }
          }
        }
      },
      include: {
        schoolTasks: {
          include: {
            userSchoolTasks: {
              where: {
                userId: Number(userId)
              }
            }
          }
        }
      }
    });

    res.json(userSchools);
  } catch (error) {
    console.error('Error fetching user schools:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user schools',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Remove a school association for a user
router.delete('/schools/user/:userId/school/:schoolId', async (req, res) => {
  const { userId, schoolId } = req.params;

  try {
    await prisma.userSchoolTasks.deleteMany({
      where: {
        userId: Number(userId),
        schoolTask: {
          lawSchool: {  // Changed from lawSchoolId to lawSchool
            id: Number(schoolId)
          }
        }
      }
    });

    res.json({ message: 'School removed successfully' });
  } catch (error) {
    console.error('Error removing school:', error);
    res.status(500).json({ error: 'Failed to remove school' });
  }
});

export default router;
