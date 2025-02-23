/*
  Warnings:

  - A unique constraint covering the columns `[userId,taskId]` on the table `UserTasks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserTasks_userId_taskId_key" ON "UserTasks"("userId", "taskId");
