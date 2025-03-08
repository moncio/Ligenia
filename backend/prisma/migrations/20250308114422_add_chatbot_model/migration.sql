-- CreateTable
CREATE TABLE "Chatbot" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chatbot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserChatbots" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserChatbots_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserChatbots_B_index" ON "_UserChatbots"("B");

-- AddForeignKey
ALTER TABLE "_UserChatbots" ADD CONSTRAINT "_UserChatbots_A_fkey" FOREIGN KEY ("A") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserChatbots" ADD CONSTRAINT "_UserChatbots_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
