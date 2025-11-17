-- DropIndex
DROP INDEX "public"."Business_owner_id_business_name_idx";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "image_public_id" TEXT,
ADD COLUMN     "image_url" TEXT;
