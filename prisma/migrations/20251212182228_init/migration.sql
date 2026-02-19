-- CreateTable
CREATE TABLE "Bot" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "steamid" TEXT NOT NULL,
    "shared_secret" TEXT NOT NULL,
    "identity_secret" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,

    CONSTRAINT "Bot_pkey" PRIMARY KEY ("id")
);
