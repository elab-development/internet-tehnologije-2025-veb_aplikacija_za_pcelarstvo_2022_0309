/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,name]` on the table `Hive` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Hive_ownerId_name_key" ON "Hive"("ownerId", "name");
