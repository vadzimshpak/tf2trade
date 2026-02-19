/*
  Warnings:

  - A unique constraint covering the columns `[login]` on the table `Bot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[steamid]` on the table `Bot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Bot_login_key" ON "Bot"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Bot_steamid_key" ON "Bot"("steamid");
