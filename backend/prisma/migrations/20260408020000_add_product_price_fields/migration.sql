-- AlterTable: Product — add price columns
ALTER TABLE "Product" ADD COLUMN "priceType" TEXT NOT NULL DEFAULT 'PER_LB';
ALTER TABLE "Product" ADD COLUMN "pricePerLb" DECIMAL(10, 4);
ALTER TABLE "Product" ADD COLUMN "pricePerBox" DECIMAL(10, 2);
ALTER TABLE "Product" ADD COLUMN "pricePerUnit" DECIMAL(10, 2);
