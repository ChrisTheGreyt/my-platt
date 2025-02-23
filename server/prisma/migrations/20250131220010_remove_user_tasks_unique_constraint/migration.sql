-- Check if the constraint exists before dropping it
DO $$ BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'UserTasks_userId_taskId_key'
    ) THEN
        ALTER TABLE "UserTasks" DROP CONSTRAINT "UserTasks_userId_taskId_key";
    END IF;
END $$;

-- Keep the index for performance
CREATE INDEX IF NOT EXISTS "UserTasks_userId_taskId_idx" ON "UserTasks"("userId", "taskId");