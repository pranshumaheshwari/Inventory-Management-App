-- DropForeignKey
ALTER TABLE `production_log` DROP FOREIGN KEY `production_log_fg_id_fkey`;

-- DropForeignKey
ALTER TABLE `production_log` DROP FOREIGN KEY `production_log_production_id_fkey`;

-- DropForeignKey
ALTER TABLE `production_log` DROP FOREIGN KEY `production_log_rm_id_fg_id_fkey`;

-- DropForeignKey
ALTER TABLE `production_log` DROP FOREIGN KEY `production_log_rm_id_fkey`;

-- AddForeignKey
ALTER TABLE `production_log` ADD CONSTRAINT `production_log_fg_id_fkey` FOREIGN KEY (`fg_id`) REFERENCES `fg`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_log` ADD CONSTRAINT `production_log_rm_id_fg_id_fkey` FOREIGN KEY (`rm_id`, `fg_id`) REFERENCES `bom`(`rm_id`, `fg_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_log` ADD CONSTRAINT `production_log_production_id_fkey` FOREIGN KEY (`production_id`) REFERENCES `production`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_log` ADD CONSTRAINT `production_log_rm_id_fkey` FOREIGN KEY (`rm_id`) REFERENCES `rm`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
