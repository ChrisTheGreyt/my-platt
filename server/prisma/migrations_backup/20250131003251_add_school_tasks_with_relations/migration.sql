-- AlterTable
ALTER TABLE "UserTasks" ADD COLUMN     "schoolTaskId" INTEGER;

-- AddForeignKey
ALTER TABLE "UserTasks" ADD CONSTRAINT "UserTasks_schoolTaskId_fkey" FOREIGN KEY ("schoolTaskId") REFERENCES "SchoolTasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolTasks" ADD CONSTRAINT "SchoolTasks_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "law_schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
