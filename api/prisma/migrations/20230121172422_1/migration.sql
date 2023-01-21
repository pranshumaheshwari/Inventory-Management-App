-- CreateTable
CREATE TABLE `production_log` (
    `production_id` INTEGER NOT NULL,
    `user` VARCHAR(191) NOT NULL,
    `fg_id` VARCHAR(191) NOT NULL,
    `rm_id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `store_stock_before` DOUBLE NULL,
    `line_stock_before` DOUBLE NULL,
    `po_pending_stock_before` DOUBLE NULL,
    `iqc_pending_stock_before` DOUBLE NULL,
    `iqc_rejected_stock_before` DOUBLE NULL,
    `po_rejected_stock_before` DOUBLE NULL,

    PRIMARY KEY (`rm_id`, `production_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `production_log` ADD CONSTRAINT `production_log_fg_id_fkey` FOREIGN KEY (`fg_id`) REFERENCES `fg`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_log` ADD CONSTRAINT `production_log_rm_id_fg_id_fkey` FOREIGN KEY (`rm_id`, `fg_id`) REFERENCES `bom`(`rm_id`, `fg_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_log` ADD CONSTRAINT `production_log_production_id_fkey` FOREIGN KEY (`production_id`) REFERENCES `production`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_log` ADD CONSTRAINT `production_log_rm_id_fkey` FOREIGN KEY (`rm_id`) REFERENCES `rm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_log` ADD CONSTRAINT `production_log_user_fkey` FOREIGN KEY (`user`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
