-- CreateTable
CREATE TABLE `attendance` (
    `number` INTEGER NOT NULL DEFAULT 0,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `type` ENUM('admin', 'store', 'ppc', 'production') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address1` VARCHAR(191) NULL,
    `address2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `gst` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `supplier_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address1` VARCHAR(191) NULL,
    `address2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `gst` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `customer_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rm` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `DTPL_code` VARCHAR(191) NOT NULL,
    `supplier_id` VARCHAR(191) NOT NULL,
    `category` ENUM('Coil', 'Connector', 'Consumables', 'Fuse', 'Grommet', 'Misc', 'Sleeve', 'Sticker', 'Tape', 'Terminal', 'Wire') NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL DEFAULT 0.00,
    `store_stock` DOUBLE NOT NULL DEFAULT 0.00,
    `iqc_pending_stock` DOUBLE NOT NULL DEFAULT 0.00,
    `line_stock` DOUBLE NOT NULL DEFAULT 0.00,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `rm_description_key`(`description`),
    UNIQUE INDEX `rm_DTPL_code_key`(`DTPL_code`),
    INDEX `supplier_id`(`supplier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fg` (
    `id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `store_stock` INTEGER NOT NULL DEFAULT 0,
    `category` ENUM('Fuse_Box', 'Indicator', 'Magneto', 'Battery_Cable', 'Lead_Wire', 'Piaggio', 'Pigtail', 'SPD') NOT NULL,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `man_power` DOUBLE NOT NULL DEFAULT 0,
    `overheads` DOUBLE NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `fg_description_key`(`description`),
    INDEX `customer_id`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bom` (
    `fg_id` VARCHAR(191) NOT NULL,
    `rm_id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `rm_id`(`rm_id`),
    PRIMARY KEY (`fg_id`, `rm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `po` (
    `id` VARCHAR(191) NOT NULL,
    `supplier_id` VARCHAR(191) NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `status` ENUM('Open', 'Closed') NULL DEFAULT 'Open',
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `supplier_id`(`supplier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `po_details` (
    `po_id` VARCHAR(191) NOT NULL,
    `rm_id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `rm_id`(`rm_id`),
    PRIMARY KEY (`po_id`, `rm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_inwards` (
    `user` VARCHAR(191) NOT NULL,
    `supplier_id` VARCHAR(191) NOT NULL,
    `invoice_number` VARCHAR(191) NOT NULL,
    `status` ENUM('PO', 'IQC', 'IN') NULL DEFAULT 'PO',
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user`(`user`),
    PRIMARY KEY (`supplier_id`, `invoice_number`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `po_inwards` (
    `user` VARCHAR(191) NOT NULL,
    `po_id` VARCHAR(191) NOT NULL,
    `supplier_id` VARCHAR(191) NOT NULL,
    `invoice_number` VARCHAR(191) NOT NULL,
    `rm_id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `status` ENUM('IQC', 'IN') NULL DEFAULT 'IQC',
    `store_stock_before` DOUBLE NULL,
    `iqc_pending_stock_before` DOUBLE NULL,
    `line_stock_before` DOUBLE NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `po_id_rm_id`(`po_id`, `rm_id`),
    INDEX `rm_id`(`rm_id`),
    INDEX `user`(`user`),
    PRIMARY KEY (`supplier_id`, `invoice_number`, `rm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `iqc_inwards` (
    `user` VARCHAR(191) NOT NULL,
    `po_id` VARCHAR(191) NOT NULL,
    `supplier_id` VARCHAR(191) NOT NULL,
    `invoice_number` VARCHAR(191) NOT NULL,
    `rm_id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `store_stock_before` DOUBLE NULL,
    `iqc_pending_stock_before` DOUBLE NULL,
    `line_stock_before` DOUBLE NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `po_id`(`po_id`, `rm_id`),
    INDEX `rm_id`(`rm_id`),
    INDEX `user`(`user`),
    PRIMARY KEY (`supplier_id`, `invoice_number`, `rm_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requisition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user` VARCHAR(191) NOT NULL,
    `so_id` VARCHAR(191) NOT NULL,
    `fg_id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `status` ENUM('Ready', 'Running', 'Closed') NOT NULL DEFAULT 'Ready',
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fg_id`(`fg_id`),
    INDEX `so_id`(`so_id`),
    INDEX `user`(`user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requisition_outward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user` VARCHAR(191) NOT NULL,
    `requisition_id` INTEGER NOT NULL,
    `rm_id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `store_stock_before` DOUBLE NULL,
    `iqc_pending_stock_before` DOUBLE NULL,
    `line_stock_before` DOUBLE NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `requisition_id`(`requisition_id`),
    INDEX `rm_id`(`rm_id`),
    INDEX `user`(`user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user` VARCHAR(191) NOT NULL,
    `so_id` VARCHAR(191) NOT NULL,
    `fg_id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `store_stock_before` DOUBLE NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fg_id`(`fg_id`),
    INDEX `so_id`(`so_id`),
    INDEX `user`(`user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rm_production_log` (
    `rm_id` VARCHAR(191) NOT NULL,
    `production_id` INTEGER NOT NULL,
    `store_stock_before` DOUBLE NULL,
    `iqc_pending_stock_before` DOUBLE NULL,
    `line_stock_before` DOUBLE NULL,

    INDEX `production_id`(`production_id`),
    PRIMARY KEY (`rm_id`, `production_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dispatch` (
    `user` VARCHAR(191) NOT NULL,
    `invoice_number` VARCHAR(191) NOT NULL,
    `so_id` VARCHAR(191) NOT NULL,
    `fg_id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `oqcStatus` ENUM('Pending', 'Finished') NULL DEFAULT 'Pending',
    `store_stock_before` DOUBLE NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fg_id`(`fg_id`),
    INDEX `so_id`(`so_id`),
    INDEX `user`(`user`),
    PRIMARY KEY (`invoice_number`, `fg_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `so` (
    `id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `status` ENUM('Open', 'Closed') NULL DEFAULT 'Open',
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `customer_id`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `so_details` (
    `so_id` VARCHAR(191) NOT NULL,
    `fg_id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fg_id`(`fg_id`),
    PRIMARY KEY (`so_id`, `fg_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rm` ADD CONSTRAINT `rm_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fg` ADD CONSTRAINT `fg_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bom` ADD CONSTRAINT `bom_fg_id_fkey` FOREIGN KEY (`fg_id`) REFERENCES `fg`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bom` ADD CONSTRAINT `bom_rm_id_fkey` FOREIGN KEY (`rm_id`) REFERENCES `rm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po` ADD CONSTRAINT `po_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_details` ADD CONSTRAINT `po_details_po_id_fkey` FOREIGN KEY (`po_id`) REFERENCES `po`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_details` ADD CONSTRAINT `po_details_rm_id_fkey` FOREIGN KEY (`rm_id`) REFERENCES `rm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_inwards` ADD CONSTRAINT `invoice_inwards_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_inwards` ADD CONSTRAINT `invoice_inwards_user_fkey` FOREIGN KEY (`user`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_inwards` ADD CONSTRAINT `po_inwards_po_id_fkey` FOREIGN KEY (`po_id`) REFERENCES `po`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_inwards` ADD CONSTRAINT `po_inwards_po_id_rm_id_fkey` FOREIGN KEY (`po_id`, `rm_id`) REFERENCES `po_details`(`po_id`, `rm_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_inwards` ADD CONSTRAINT `po_inwards_rm_id_fkey` FOREIGN KEY (`rm_id`) REFERENCES `rm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_inwards` ADD CONSTRAINT `po_inwards_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_inwards` ADD CONSTRAINT `po_inwards_supplier_id_invoice_number_fkey` FOREIGN KEY (`supplier_id`, `invoice_number`) REFERENCES `invoice_inwards`(`supplier_id`, `invoice_number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_inwards` ADD CONSTRAINT `po_inwards_user_fkey` FOREIGN KEY (`user`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `iqc_inwards` ADD CONSTRAINT `iqc_inwards_po_id_fkey` FOREIGN KEY (`po_id`) REFERENCES `po`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `iqc_inwards` ADD CONSTRAINT `iqc_inwards_po_id_rm_id_fkey` FOREIGN KEY (`po_id`, `rm_id`) REFERENCES `po_details`(`po_id`, `rm_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `iqc_inwards` ADD CONSTRAINT `iqc_inwards_rm_id_fkey` FOREIGN KEY (`rm_id`) REFERENCES `rm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `iqc_inwards` ADD CONSTRAINT `iqc_inwards_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `iqc_inwards` ADD CONSTRAINT `iqc_inwards_supplier_id_invoice_number_fkey` FOREIGN KEY (`supplier_id`, `invoice_number`) REFERENCES `invoice_inwards`(`supplier_id`, `invoice_number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `iqc_inwards` ADD CONSTRAINT `iqc_inwards_user_fkey` FOREIGN KEY (`user`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisition` ADD CONSTRAINT `requisition_fg_id_fkey` FOREIGN KEY (`fg_id`) REFERENCES `fg`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisition` ADD CONSTRAINT `requisition_so_id_fkey` FOREIGN KEY (`so_id`) REFERENCES `so`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisition` ADD CONSTRAINT `requisition_user_fkey` FOREIGN KEY (`user`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisition_outward` ADD CONSTRAINT `requisition_outward_requisition_id_fkey` FOREIGN KEY (`requisition_id`) REFERENCES `requisition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisition_outward` ADD CONSTRAINT `requisition_outward_rm_id_fkey` FOREIGN KEY (`rm_id`) REFERENCES `rm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisition_outward` ADD CONSTRAINT `requisition_outward_user_fkey` FOREIGN KEY (`user`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production` ADD CONSTRAINT `production_fg_id_fkey` FOREIGN KEY (`fg_id`) REFERENCES `fg`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production` ADD CONSTRAINT `production_so_id_fkey` FOREIGN KEY (`so_id`) REFERENCES `so`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production` ADD CONSTRAINT `production_user_fkey` FOREIGN KEY (`user`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rm_production_log` ADD CONSTRAINT `rm_production_log_production_id_fkey` FOREIGN KEY (`production_id`) REFERENCES `production`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rm_production_log` ADD CONSTRAINT `rm_production_log_rm_id_fkey` FOREIGN KEY (`rm_id`) REFERENCES `rm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispatch` ADD CONSTRAINT `dispatch_fg_id_fkey` FOREIGN KEY (`fg_id`) REFERENCES `fg`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispatch` ADD CONSTRAINT `dispatch_so_id_fkey` FOREIGN KEY (`so_id`) REFERENCES `so`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispatch` ADD CONSTRAINT `dispatch_user_fkey` FOREIGN KEY (`user`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `so` ADD CONSTRAINT `so_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `so_details` ADD CONSTRAINT `so_details_fg_id_fkey` FOREIGN KEY (`fg_id`) REFERENCES `fg`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `so_details` ADD CONSTRAINT `so_details_so_id_fkey` FOREIGN KEY (`so_id`) REFERENCES `so`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
