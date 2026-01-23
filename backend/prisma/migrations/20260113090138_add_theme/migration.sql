/*
  Warnings:

  - Added the required column `endAt` to the `Theme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startAt` to the `Theme` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Theme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Theme" ("id", "name") SELECT "id", "name" FROM "Theme";
DROP TABLE "Theme";
ALTER TABLE "new_Theme" RENAME TO "Theme";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
