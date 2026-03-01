-- AlterTable
ALTER TABLE "Occupant" ADD COLUMN "aadharId" TEXT;
ALTER TABLE "Occupant" ADD COLUMN "phoneNumber" TEXT;
ALTER TABLE "Occupant" ADD COLUMN "photoUrl" TEXT;

-- CreateTable
CREATE TABLE "BillingConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rentDueDay" INTEGER NOT NULL DEFAULT 5,
    "billDueDay" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenancyId" TEXT NOT NULL,
    CONSTRAINT "BillingConfig_tenancyId_fkey" FOREIGN KEY ("tenancyId") REFERENCES "Tenancy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingConfig_tenancyId_key" ON "BillingConfig"("tenancyId");
