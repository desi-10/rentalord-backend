-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UnitImage" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_public_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UnitImage" ADD CONSTRAINT "UnitImage_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
