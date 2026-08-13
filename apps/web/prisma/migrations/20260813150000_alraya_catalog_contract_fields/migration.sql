-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `nationalId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Offer` ADD COLUMN `listPrice` DECIMAL(12, 2) NULL;

-- AlterTable
ALTER TABLE `Event` ADD COLUMN `agreementNo` VARCHAR(191) NULL,
    ADD COLUMN `deliveryDueAt` DATETIME(3) NULL;
