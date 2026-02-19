-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "assetid" TEXT NOT NULL,
    "classid" TEXT NOT NULL,
    "instanceid" TEXT NOT NULL,
    "market_hash_name" TEXT NOT NULL,
    "icon_url" TEXT NOT NULL,
    "price_usd" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_assetid_key" ON "Item"("assetid");

-- CreateIndex
CREATE UNIQUE INDEX "Item_market_hash_name_key" ON "Item"("market_hash_name");
