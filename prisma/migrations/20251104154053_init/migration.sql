/*
  Warnings:

  - You are about to drop the column `lastAttempt` on the `LoginAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `lockCount` on the `LoginAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `lockedUntil` on the `LoginAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `OTP` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `OTP` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `invited_by` on the `PropertyInvite` table. All the data in the column will be lost.
  - You are about to drop the column `submitted_by` on the `PropertyVerification` table. All the data in the column will be lost.
  - You are about to drop the column `verified_by` on the `PropertyVerification` table. All the data in the column will be lost.
  - You are about to drop the column `isTwoFactorEnabled` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,created_by_id]` on the table `Property` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expires_at` to the `OTP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by_id` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invited_by_id` to the `PropertyInvite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `submitted_by_id` to the `PropertyVerification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NoticeType" AS ENUM ('general', 'rules', 'accouncement');

-- DropForeignKey
ALTER TABLE "public"."OTP" DROP CONSTRAINT "OTP_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Property" DROP CONSTRAINT "Property_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."PropertyInvite" DROP CONSTRAINT "PropertyInvite_invited_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."PropertyVerification" DROP CONSTRAINT "PropertyVerification_submitted_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."PropertyVerification" DROP CONSTRAINT "PropertyVerification_verified_by_fkey";

-- AlterTable
ALTER TABLE "LoginAttempt" DROP COLUMN "lastAttempt",
DROP COLUMN "lockCount",
DROP COLUMN "lockedUntil",
ADD COLUMN     "last_attempt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lock_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "locked_until" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OTP" DROP COLUMN "expiresAt",
DROP COLUMN "userId",
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "created_by",
ADD COLUMN     "created_by_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PropertyInvite" DROP COLUMN "invited_by",
ADD COLUMN     "invited_by_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PropertyVerification" DROP COLUMN "submitted_by",
DROP COLUMN "verified_by",
ADD COLUMN     "submitted_by_id" TEXT NOT NULL,
ADD COLUMN     "verified_by_id" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isTwoFactorEnabled",
ADD COLUMN     "is_two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "organization_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoticeBoard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "posted_by_id" TEXT NOT NULL,
    "notice_type" "NoticeType" NOT NULL DEFAULT 'general',
    "visible_from" TIMESTAMP(3) NOT NULL,
    "visible_to" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoticeBoard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_name_created_by_id_key" ON "Property"("name", "created_by_id");

-- CreateIndex
CREATE INDEX "PropertyMembership_user_id_property_id_idx" ON "PropertyMembership"("user_id", "property_id");

-- CreateIndex
CREATE INDEX "Unit_name_property_id_idx" ON "Unit"("name", "property_id");

-- CreateIndex
CREATE INDEX "User_phone_number_idx" ON "User"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyVerification" ADD CONSTRAINT "PropertyVerification_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyVerification" ADD CONSTRAINT "PropertyVerification_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyInvite" ADD CONSTRAINT "PropertyInvite_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoticeBoard" ADD CONSTRAINT "NoticeBoard_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoticeBoard" ADD CONSTRAINT "NoticeBoard_posted_by_id_fkey" FOREIGN KEY ("posted_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
