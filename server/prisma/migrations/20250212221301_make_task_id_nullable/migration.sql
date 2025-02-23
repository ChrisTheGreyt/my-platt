/*
  Warnings:

  - You are about to drop the `TeamUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TeamUser" DROP CONSTRAINT "TeamUser_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamUser" DROP CONSTRAINT "TeamUser_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "teamId" INTEGER;

-- DropTable
DROP TABLE "TeamUser";
