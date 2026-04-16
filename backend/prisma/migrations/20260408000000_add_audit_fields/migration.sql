-- AlterTable: Order — add updatedById
ALTER TABLE "Order" ADD COLUMN "updatedById" INTEGER;

-- AlterTable: Container — add updatedById
ALTER TABLE "Container" ADD COLUMN "updatedById" INTEGER;

-- AlterTable: BoxWeight — add updatedById, createdAt, updatedAt
ALTER TABLE "BoxWeight" ADD COLUMN "updatedById" INTEGER;
ALTER TABLE "BoxWeight" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "BoxWeight" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
