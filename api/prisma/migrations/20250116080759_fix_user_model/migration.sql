/*
  Warnings:

  - You are about to drop the column `remark` on the `FoodType` table. All the data in the column will be lost.
  - The `level` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE');

-- AlterTable
ALTER TABLE "FoodType" DROP COLUMN "remark";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "level",
ADD COLUMN     "level" "Role" NOT NULL DEFAULT 'EMPLOYEE';
