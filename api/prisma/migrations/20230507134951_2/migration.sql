/*
  Warnings:

  - You are about to drop the column `status` on the `requisition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `requisition` DROP COLUMN `status`;

-- CreateTable
CREATE TABLE `requisition_details` (
    `user` VARCHAR(191) NOT NULL,
    `requisition_id` INTEGER NOT NULL,
    `rm_id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',

    PRIMARY KEY (`requisition_id`, `rm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `requisition_details` ADD CONSTRAINT `requisition_details_requisition_id_fkey` FOREIGN KEY (`requisition_id`) REFERENCES `requisition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisition_details` ADD CONSTRAINT `requisition_details_rm_id_fkey` FOREIGN KEY (`rm_id`) REFERENCES `rm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisition_details` ADD CONSTRAINT `requisition_details_user_fkey` FOREIGN KEY (`user`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
