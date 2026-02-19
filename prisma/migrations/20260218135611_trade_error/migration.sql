-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "error" TEXT,
ALTER COLUMN "tradeoffer_id" DROP NOT NULL,
ALTER COLUMN "user_items" DROP NOT NULL,
ALTER COLUMN "bot_items" DROP NOT NULL;
