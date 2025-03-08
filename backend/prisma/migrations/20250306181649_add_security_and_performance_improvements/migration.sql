/*
  Warnings:

  - You are about to alter the column `name` on the `League` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The `scoringType` column on the `League` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `name` on the `Tournament` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The `modality` column on the `Tournament` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Tournament` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `League` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Statistic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PLAYER', 'COACH', 'REFEREE');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TournamentModality" AS ENUM ('SINGLES', 'DOUBLES', 'MIXED');

-- CreateEnum
CREATE TYPE "ScoringType" AS ENUM ('STANDARD', 'ADVANCED', 'CUSTOM');

-- AlterTable
ALTER TABLE "League" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
DROP COLUMN "scoringType",
ADD COLUMN     "scoringType" "ScoringType" NOT NULL DEFAULT 'STANDARD';

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "location" VARCHAR(255),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Statistic" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "points" SET DEFAULT 0,
ALTER COLUMN "wins" SET DEFAULT 0,
ALTER COLUMN "losses" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
DROP COLUMN "modality",
ADD COLUMN     "modality" "TournamentModality" NOT NULL DEFAULT 'DOUBLES',
DROP COLUMN "status",
ADD COLUMN     "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'PLAYER';

-- CreateIndex
CREATE INDEX "League_adminId_idx" ON "League"("adminId");

-- CreateIndex
CREATE INDEX "League_name_idx" ON "League"("name");

-- CreateIndex
CREATE INDEX "Match_tournamentId_idx" ON "Match"("tournamentId");

-- CreateIndex
CREATE INDEX "Match_date_idx" ON "Match"("date");

-- CreateIndex
CREATE INDEX "Match_team1Id_team2Id_idx" ON "Match"("team1Id", "team2Id");

-- CreateIndex
CREATE INDEX "Statistic_playerId_idx" ON "Statistic"("playerId");

-- CreateIndex
CREATE INDEX "Statistic_tournamentId_idx" ON "Statistic"("tournamentId");

-- CreateIndex
CREATE INDEX "Statistic_points_idx" ON "Statistic"("points");

-- CreateIndex
CREATE INDEX "Team_tournamentId_idx" ON "Team"("tournamentId");

-- CreateIndex
CREATE INDEX "Team_player1Id_player2Id_idx" ON "Team"("player1Id", "player2Id");

-- CreateIndex
CREATE INDEX "Tournament_leagueId_idx" ON "Tournament"("leagueId");

-- CreateIndex
CREATE INDEX "Tournament_status_idx" ON "Tournament"("status");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
