/*
  Warnings:

  - You are about to alter the column `weightLb` on the `BoxWeight` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,4)`.
  - You are about to alter the column `weightLb` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,4)`.
  - You are about to alter the column `weightLb` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,4)`.
  - You are about to alter the column `pricePerLb` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,4)`.
  - You are about to alter the column `pricePerBox` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_clientId_fkey";

-- AlterTable
ALTER TABLE "BoxWeight" ALTER COLUMN "weightLb" SET DATA TYPE DECIMAL(10,4);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "clientName" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "clientId" DROP NOT NULL,
ALTER COLUMN "weightLb" SET DATA TYPE DECIMAL(10,4);

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "weightLb" SET DATA TYPE DECIMAL(10,4),
ALTER COLUMN "pricePerLb" SET DATA TYPE DECIMAL(10,4),
ALTER COLUMN "pricePerBox" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'VENDEDOR';

-- CreateIndex
CREATE INDEX "Container_zone_idx" ON "Container"("zone");

-- CreateIndex
CREATE INDEX "Container_productId_idx" ON "Container"("productId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_clientId_idx" ON "Order"("clientId");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

-- CreateIndex
CREATE INDEX "Product_active_idx" ON "Product"("active");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
