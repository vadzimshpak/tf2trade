/*
  Warnings:

  - A unique constraint covering the columns `[api_key]` on the table `Bot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "steamid" TEXT NOT NULL,
    "tradelink" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_steamid_key" ON "User"("steamid");

-- CreateIndex
CREATE UNIQUE INDEX "User_tradelink_key" ON "User"("tradelink");

-- CreateIndex
CREATE UNIQUE INDEX "Bot_api_key_key" ON "Bot"("api_key");
