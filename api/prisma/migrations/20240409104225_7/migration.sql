/*
  Warnings:

  - The primary key for the `requisition_excess_on_line` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[rm_id,fg_id]` on the table `bom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `requisition_excess_on_line` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user` to the `requisition_excess_on_line` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `requisition_excess_on_line` DROP CONSTRAINT `requisition_excess_on_line_rm_id_fkey`;
-- AlterTable
ALTER TABLE `requisition_excess_on_line` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `iqc_pending_stock_before` DOUBLE NULL,
    ADD COLUMN `iqc_rejected_stock_before` DOUBLE NULL,
    ADD COLUMN `line_stock_before` DOUBLE NULL,
    ADD COLUMN `po_pending_stock_before` DOUBLE NULL,
    ADD COLUMN `po_rejected_stock_before` DOUBLE NULL,
    ADD COLUMN `store_stock_before` DOUBLE NULL,
    ADD COLUMN `user` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `rm` ADD COLUMN `excess_on_line` DOUBLE NOT NULL DEFAULT 0.00;

-- CreateIndex
CREATE UNIQUE INDEX `bom_rm_id_fg_id_key` ON `bom`(`rm_id`, `fg_id`);

-- AddForeignKey
ALTER TABLE `requisition_excess_on_line` ADD CONSTRAINT `requisition_excess_on_line_user_fkey` FOREIGN KEY (`user`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
