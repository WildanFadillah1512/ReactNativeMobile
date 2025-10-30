/*
  Warnings:

  - Added the required column `sellerId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "period" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "reviews" INTEGER,
ADD COLUMN     "sellerId" INTEGER NOT NULL,
ADD COLUMN     "trending" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Seller" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "rating" DOUBLE PRECISION,
    "itemsRented" INTEGER,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
