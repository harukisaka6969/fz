-- CreateTable
CREATE TABLE "TherapistCustomer" (
    "id" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TherapistCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TherapistCustomer_therapistId_customerId_key" ON "TherapistCustomer"("therapistId", "customerId");

-- AddForeignKey
ALTER TABLE "TherapistCustomer" ADD CONSTRAINT "TherapistCustomer_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistCustomer" ADD CONSTRAINT "TherapistCustomer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
