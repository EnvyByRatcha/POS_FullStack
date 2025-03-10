/*
  Warnings:

  - You are about to drop the column `remark` on the `FoodSize` table. All the data in the column will be lost.
  - You are about to drop the column `remark` on the `Taste` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FoodSize" DROP COLUMN "remark";

-- AlterTable
ALTER TABLE "Taste" DROP COLUMN "remark";
