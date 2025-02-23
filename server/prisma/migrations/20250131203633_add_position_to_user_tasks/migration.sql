-- AlterTable
ALTER TABLE "UserTasks" ADD COLUMN "position" INTEGER;

-- Update existing records to have sequential positions within their status groups
WITH ranked_tasks AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "userId", status 
      ORDER BY id
    ) as new_position
  FROM "UserTasks"
)
UPDATE "UserTasks"
SET position = ranked_tasks.new_position
FROM ranked_tasks
WHERE "UserTasks".id = ranked_tasks.id;