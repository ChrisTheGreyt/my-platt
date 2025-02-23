-- Update position field to be non-nullable with default value
ALTER TABLE "UserTasks" ALTER COLUMN "position" SET NOT NULL,
                        ALTER COLUMN "position" SET DEFAULT 0;

-- Create index for efficient querying of tasks by user and status with position ordering
CREATE INDEX "UserTasks_userId_status_position_idx" ON "UserTasks"("userId", "status", "position");

-- Update any existing null positions to their index within their status group
WITH ranked_tasks AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "userId", status 
      ORDER BY id
    ) - 1 as new_position
  FROM "UserTasks"
)
UPDATE "UserTasks"
SET position = ranked_tasks.new_position
FROM ranked_tasks
WHERE "UserTasks".id = ranked_tasks.id;