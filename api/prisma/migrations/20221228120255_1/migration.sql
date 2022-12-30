/*
  Warnings:

  - You are about to drop the `invoice_po` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `invoice_po` DROP FOREIGN KEY `invoice_po_invoice_id_supplier_id_fkey`;

-- DropForeignKey
ALTER TABLE `invoice_po` DROP FOREIGN KEY `invoice_po_po_id_fkey`;

-- AlterTable
ALTER TABLE `inwards_po_pending` ADD COLUMN `po_id` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `invoice_po`;

-- AddForeignKey
ALTER TABLE `inwards_po_pending` ADD CONSTRAINT `inwards_po_pending_po_id_fkey` FOREIGN KEY (`po_id`) REFERENCES `po`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
