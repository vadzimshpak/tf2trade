-- CreateTable
CREATE TABLE "Trade" (
    "id" SERIAL NOT NULL,
    "botId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "tradeoffer_id" INTEGER NOT NULL,
    "user_items" JSONB NOT NULL,
    "bot_items" JSONB NOT NULL,
    "status" INTEGER NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trade_tradeoffer_id_key" ON "Trade"("tradeoffer_id");

-- CreateIndex
CREATE INDEX "Item_market_hash_name_idx" ON "Item" USING HASH ("market_hash_name");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
