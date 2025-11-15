/*
  Warnings:

  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,created_by_id,business_id]` on the table `Property` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `business_id` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Organization" DROP CONSTRAINT "Organization_owner_id_fkey";

-- DropIndex
DROP INDEX "public"."Property_name_created_by_id_key";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "business_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Organization";

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Business_owner_id_business_name_key" ON "Business"("owner_id", "business_name");

-- CreateIndex
CREATE UNIQUE INDEX "Property_name_created_by_id_business_id_key" ON "Property"("name", "created_by_id", "business_id");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
