-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE "_MatchStatistics" ADD CONSTRAINT "_MatchStatistics_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_MatchStatistics_AB_unique";

-- AlterTable
ALTER TABLE "_TeamMatches" ADD CONSTRAINT "_TeamMatches_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_TeamMatches_AB_unique";

-- AlterTable
ALTER TABLE "_UserChatbots" ADD CONSTRAINT "_UserChatbots_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UserChatbots_AB_unique";

-- AlterTable
ALTER TABLE "_UserRoles" ADD CONSTRAINT "_UserRoles_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UserRoles_AB_unique";

-- AlterTable
ALTER TABLE "_UserTeams" ADD CONSTRAINT "_UserTeams_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UserTeams_AB_unique";

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");
