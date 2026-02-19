/*
  Warnings:

  - You are about to drop the column `assetid` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `classid` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `icon_url` on the `item` table. All the data in the column will be lost.
  - You are about to drop the column `instanceid` on the `item` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Item_assetid_key";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "assetid",
DROP COLUMN "classid",
DROP COLUMN "icon_url",
DROP COLUMN "instanceid",
ALTER COLUMN "price_usd" DROP NOT NULL;
