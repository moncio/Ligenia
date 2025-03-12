/*
  Warnings:

  - The primary key for the `_MatchStatistics` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_TeamMatches` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_UserChatbots` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_UserRoles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_UserTeams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_MatchStatistics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_TeamMatches` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_UserChatbots` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_UserRoles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_UserTeams` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_MatchStatistics" DROP CONSTRAINT "_MatchStatistics_AB_pkey";

-- AlterTable
ALTER TABLE "_TeamMatches" DROP CONSTRAINT "_TeamMatches_AB_pkey";

-- AlterTable
ALTER TABLE "_UserChatbots" DROP CONSTRAINT "_UserChatbots_AB_pkey";

-- AlterTable
ALTER TABLE "_UserRoles" DROP CONSTRAINT "_UserRoles_AB_pkey";

-- AlterTable
ALTER TABLE "_UserTeams" DROP CONSTRAINT "_UserTeams_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_MatchStatistics_AB_unique" ON "_MatchStatistics"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_TeamMatches_AB_unique" ON "_TeamMatches"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserChatbots_AB_unique" ON "_UserChatbots"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserRoles_AB_unique" ON "_UserRoles"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserTeams_AB_unique" ON "_UserTeams"("A", "B");
