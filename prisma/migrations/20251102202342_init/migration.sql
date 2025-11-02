/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `SubscriptionPlan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,property_id]` on the table `Unit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AccessRole" AS ENUM ('user', 'superadmin');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "access_role" "AccessRole" NOT NULL DEFAULT 'user';

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_name_key" ON "SubscriptionPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_name_property_id_key" ON "Unit"("name", "property_id");
