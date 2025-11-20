/*
  Warnings:

  - A unique constraint covering the columns `[property_id,business_id,token]` on the table `PropertyInvite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[property_id,business_id,id]` on the table `PropertyInvite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `business_id` to the `PropertyInvite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PropertyInvite" ADD COLUMN     "business_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "PropertyInvite_property_id_business_id_phone_number_idx" ON "PropertyInvite"("property_id", "business_id", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyInvite_property_id_business_id_token_key" ON "PropertyInvite"("property_id", "business_id", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyInvite_property_id_business_id_id_key" ON "PropertyInvite"("property_id", "business_id", "id");

-- AddForeignKey
ALTER TABLE "PropertyInvite" ADD CONSTRAINT "PropertyInvite_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
