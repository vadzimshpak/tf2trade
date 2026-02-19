/*
  Warnings:

  - You are about to drop the column `api_key` on the `Bot` table. All the data in the column will be lost.
  - You are about to drop the column `identity_secret` on the `Bot` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Bot` table. All the data in the column will be lost.
  - You are about to drop the column `shared_secret` on the `Bot` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Bot_api_key_key";

-- AlterTable
ALTER TABLE "Bot" DROP COLUMN "api_key",
DROP COLUMN "identity_secret",
DROP COLUMN "password",
DROP COLUMN "shared_secret";
