/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `PropertyInvite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[property_id,business_id,phone_number]` on the table `PropertyInvite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."PropertyInvite_property_id_business_id_id_key";

-- DropIndex
DROP INDEX "public"."PropertyInvite_property_id_business_id_phone_number_idx";

-- DropIndex
DROP INDEX "public"."PropertyInvite_property_id_business_id_token_key";

-- CreateIndex
CREATE UNIQUE INDEX "PropertyInvite_token_key" ON "PropertyInvite"("token");

-- CreateIndex
CREATE INDEX "PropertyInvite_property_id_business_id_idx" ON "PropertyInvite"("property_id", "business_id");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyInvite_property_id_business_id_phone_number_key" ON "PropertyInvite"("property_id", "business_id", "phone_number");
