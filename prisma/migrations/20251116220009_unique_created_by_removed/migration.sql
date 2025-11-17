/*
  Warnings:

  - A unique constraint covering the columns `[name,business_id]` on the table `Property` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Property_name_created_by_id_business_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "Property_name_business_id_key" ON "Property"("name", "business_id");
