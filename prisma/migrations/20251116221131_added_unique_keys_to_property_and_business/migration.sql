/*
  Warnings:

  - A unique constraint covering the columns `[id,business_id]` on the table `Property` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Business_owner_id_business_name_idx" ON "Business"("owner_id", "business_name");

-- CreateIndex
CREATE UNIQUE INDEX "Property_id_business_id_key" ON "Property"("id", "business_id");
