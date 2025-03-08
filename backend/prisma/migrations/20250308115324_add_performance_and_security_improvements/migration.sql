/*
  Warnings:

  - You are about to drop the column `location` on the `Match` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AuditActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'PERMISSION_CHANGE', 'SYSTEM_CONFIG');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MATCH_SCHEDULED', 'MATCH_RESULT', 'TOURNAMENT_UPDATE', 'TEAM_INVITATION', 'SYSTEM_ANNOUNCEMENT');

-- AlterTable
ALTER TABLE "League" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "logoUrl" VARCHAR(255);

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "location",
ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "Statistic" ADD COLUMN     "aces" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "advancedStats" JSONB,
ADD COLUMN     "breakPointsFaced" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "breakPointsSaved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "doubleFaults" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "firstServePercentage" DECIMAL(5,2),
ADD COLUMN     "gamesLost" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gamesWon" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "performanceRating" DECIMAL(5,2),
ADD COLUMN     "secondServePercentage" DECIMAL(5,2),
ADD COLUMN     "setsLost" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "setsWon" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "winningPercentage" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "logoUrl" VARCHAR(255),
ADD COLUMN     "ranking" INTEGER;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "description" TEXT,
ADD COLUMN     "logoUrl" VARCHAR(255),
ADD COLUMN     "maxTeams" INTEGER,
ADD COLUMN     "minTeams" INTEGER,
ADD COLUMN     "prizes" JSONB,
ADD COLUMN     "registrationFee" DECIMAL(10,2),
ADD COLUMN     "rules" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "emailVerificationExpiry" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" VARCHAR(255),
ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "phoneNumber" VARCHAR(20),
ADD COLUMN     "playingLevel" VARCHAR(20),
ADD COLUMN     "preferredHand" VARCHAR(10),
ADD COLUMN     "profilePictureUrl" VARCHAR(255),
ADD COLUMN     "resetPasswordExpiry" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" VARCHAR(255),
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" VARCHAR(255);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(20),
    "country" VARCHAR(100) NOT NULL,
    "coordinates" JSONB,
    "facilities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "relatedData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actionType" "AuditActionType" NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" VARCHAR(50) NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" VARCHAR(50),
    "userAgent" VARCHAR(255),
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Location_city_idx" ON "Location"("city");

-- CreateIndex
CREATE INDEX "Location_name_idx" ON "Location"("name");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actionType_idx" ON "AuditLog"("actionType");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "League_isPublic_idx" ON "League"("isPublic");

-- CreateIndex
CREATE INDEX "League_creationDate_idx" ON "League"("creationDate");

-- CreateIndex
CREATE INDEX "Match_locationId_idx" ON "Match"("locationId");

-- CreateIndex
CREATE INDEX "Statistic_wins_losses_idx" ON "Statistic"("wins", "losses");

-- CreateIndex
CREATE INDEX "Statistic_performanceRating_idx" ON "Statistic"("performanceRating");

-- CreateIndex
CREATE INDEX "Team_name_idx" ON "Team"("name");

-- CreateIndex
CREATE INDEX "Team_ranking_idx" ON "Team"("ranking");

-- CreateIndex
CREATE INDEX "Tournament_startDate_endDate_idx" ON "Tournament"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Tournament_name_idx" ON "Tournament"("name");

-- CreateIndex
CREATE INDEX "User_isEmailVerified_idx" ON "User"("isEmailVerified");

-- CreateIndex
CREATE INDEX "User_lastLogin_idx" ON "User"("lastLogin");

-- CreateIndex
CREATE INDEX "User_failedLoginAttempts_idx" ON "User"("failedLoginAttempts");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
