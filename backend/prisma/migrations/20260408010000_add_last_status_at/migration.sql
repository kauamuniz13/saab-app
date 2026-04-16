-- AlterTable: Order — add lastStatusAt for offline conflict detection
ALTER TABLE "Order" ADD COLUMN "lastStatusAt" TIMESTAMP(3);
