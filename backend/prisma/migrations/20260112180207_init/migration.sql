-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "feeling" INTEGER NOT NULL,
    "performance" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT
);
