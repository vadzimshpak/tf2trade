/*
  Warnings:

  - You are about to drop the column `price_usd` on the `Item` table. All the data in the column will be lost.
  - Added the required column `limit` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_buy` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_sell` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "price_usd",
ADD COLUMN     "limit" INTEGER NOT NULL,
ADD COLUMN     "price_buy" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "price_sell" DOUBLE PRECISION NOT NULL;
