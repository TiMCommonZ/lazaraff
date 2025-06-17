-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coverMediaId" TEXT,
    "bannerMediaId" TEXT,
    CONSTRAINT "Article_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_bannerMediaId_fkey" FOREIGN KEY ("bannerMediaId") REFERENCES "Media" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("bannerMediaId", "coverMediaId", "createdAt", "id", "title") SELECT "bannerMediaId", "coverMediaId", "createdAt", "id", "title" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "normalPrice" REAL NOT NULL,
    "specialPrice" REAL,
    "mainRating" INTEGER NOT NULL DEFAULT 0,
    "qualityRating" INTEGER NOT NULL DEFAULT 0,
    "performanceRating" INTEGER NOT NULL DEFAULT 0,
    "valueRating" INTEGER NOT NULL DEFAULT 0,
    "qualityRatingLabel" TEXT NOT NULL DEFAULT 'คุณภาพ',
    "performanceRatingLabel" TEXT NOT NULL DEFAULT 'ประสิทธิภาพ',
    "valueRatingLabel" TEXT NOT NULL DEFAULT 'ความคุ้มค่า',
    "description" TEXT,
    "productLink" TEXT NOT NULL,
    "comparePriceLink" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coverMediaId" TEXT,
    CONSTRAINT "Product_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("comparePriceLink", "coverMediaId", "createdAt", "description", "id", "mainRating", "normalPrice", "performanceRating", "performanceRatingLabel", "productLink", "qualityRating", "qualityRatingLabel", "specialPrice", "title", "valueRating", "valueRatingLabel") SELECT "comparePriceLink", "coverMediaId", "createdAt", "description", "id", "mainRating", "normalPrice", "performanceRating", "performanceRatingLabel", "productLink", "qualityRating", "qualityRatingLabel", "specialPrice", "title", "valueRating", "valueRatingLabel" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_Slide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mediaId" TEXT,
    CONSTRAINT "Slide_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Slide" ("createdAt", "description", "id", "link", "mediaId", "title") SELECT "createdAt", "description", "id", "link", "mediaId", "title" FROM "Slide";
DROP TABLE "Slide";
ALTER TABLE "new_Slide" RENAME TO "Slide";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
