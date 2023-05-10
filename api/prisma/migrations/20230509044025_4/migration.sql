-- CreateTable
CREATE TABLE `requisition_excess_on_line` (
    `rm_id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`rm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `requisition_excess_on_line` ADD CONSTRAINT `requisition_excess_on_line_rm_id_fkey` FOREIGN KEY (`rm_id`) REFERENCES `rm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
