/*
  Warnings:

  - You are about to drop the column `soId` on the `dispatch` table. All the data in the column will be lost.
  - Added the required column `so_id` to the `dispatch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dispatch` DROP COLUMN `soId`,
    ADD COLUMN `so_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `dispatch` ADD CONSTRAINT `dispatch_so_id_fkey` FOREIGN KEY (`so_id`) REFERENCES `so`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispatch` ADD CONSTRAINT `dispatch_so_id_fg_id_fkey` FOREIGN KEY (`so_id`, `fg_id`) REFERENCES `so_details`(`so_id`, `fg_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
