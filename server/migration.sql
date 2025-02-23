-- DropForeignKey
ALTER TABLE "UserTasks" DROP CONSTRAINT "UserTasks_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserTasks" DROP CONSTRAINT "UserTasks_schoolTaskId_fkey";

-- DropForeignKey
ALTER TABLE "SchoolTasks" DROP CONSTRAINT "SchoolTasks_schoolId_fkey";

-- DropIndex
DROP INDEX "law_schools_school_key";

-- AlterTable
ALTER TABLE "UserTasks" DROP COLUMN "schoolTaskId";

-- DropTable
DROP TABLE "SchoolTasks";

