-- CreateTable
CREATE TABLE "RandomResult" (
    "id" SERIAL NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RandomResult_pkey" PRIMARY KEY ("id")
);
