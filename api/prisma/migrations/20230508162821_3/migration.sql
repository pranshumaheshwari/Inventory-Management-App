-- AddForeignKey
ALTER TABLE `requisition_outward` ADD CONSTRAINT `requisition_outward_requisition_id_rm_id_fkey` FOREIGN KEY (`requisition_id`, `rm_id`) REFERENCES `requisition_details`(`requisition_id`, `rm_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
