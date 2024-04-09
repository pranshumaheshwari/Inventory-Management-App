DELIMITER $$

CREATE TRIGGER `inwards_po_pending_set_stock`
BEFORE INSERT
ON inwards_po_pending FOR EACH ROW
BEGIN
	SET NEW.store_stock_before = (SELECT store_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.line_stock_before = (SELECT line_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.po_pending_stock_before = (SELECT po_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.po_rejected_stock_before = (SELECT po_rejected_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_pending_stock_before = (SELECT iqc_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_rejected_stock_before = (SELECT iqc_rejected_stock FROM rm WHERE id=NEW.rm_id);
END$$

CREATE TRIGGER `inwards_iqc_pending_set_stock`
BEFORE INSERT
ON inwards_iqc_pending FOR EACH ROW
BEGIN
	SET NEW.store_stock_before = (SELECT store_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.line_stock_before = (SELECT line_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.po_pending_stock_before = (SELECT po_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.po_rejected_stock_before = (SELECT po_rejected_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_pending_stock_before = (SELECT iqc_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_rejected_stock_before = (SELECT iqc_rejected_stock FROM rm WHERE id=NEW.rm_id);
END$$

CREATE TRIGGER `inwards_verified_set_stock`
BEFORE INSERT
ON inwards_verified FOR EACH ROW
BEGIN
	SET NEW.store_stock_before = (SELECT store_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.line_stock_before = (SELECT line_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.po_pending_stock_before = (SELECT po_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.po_rejected_stock_before = (SELECT po_rejected_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_pending_stock_before = (SELECT iqc_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_rejected_stock_before = (SELECT iqc_rejected_stock FROM rm WHERE id=NEW.rm_id);
END$$

CREATE TRIGGER `requisition_outward_set_stock`
BEFORE INSERT
ON requisition_outward FOR EACH ROW
BEGIN
	SET NEW.store_stock_before = (SELECT store_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.line_stock_before = (SELECT line_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.po_pending_stock_before = (SELECT po_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.po_rejected_stock_before = (SELECT po_rejected_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_pending_stock_before = (SELECT iqc_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_rejected_stock_before = (SELECT iqc_rejected_stock FROM rm WHERE id=NEW.rm_id);
END$$

CREATE TRIGGER `production_set_rm_stock`
BEFORE INSERT
ON production_log FOR EACH ROW
BEGIN
	SET NEW.store_stock_before = (SELECT store_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.line_stock_before = (SELECT line_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.po_pending_stock_before = (SELECT po_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.po_rejected_stock_before = (SELECT po_rejected_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_pending_stock_before = (SELECT iqc_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_rejected_stock_before = (SELECT iqc_rejected_stock FROM rm WHERE id=NEW.rm_id);
END$$

CREATE TRIGGER `rm_manual_set_rm_stock`
BEFORE INSERT
ON rm_manual_update FOR EACH ROW
BEGIN
	SET NEW.store_stock_before = (SELECT store_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.line_stock_before = (SELECT line_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.po_pending_stock_before = (SELECT po_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.po_rejected_stock_before = (SELECT po_rejected_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_pending_stock_before = (SELECT iqc_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_rejected_stock_before = (SELECT iqc_rejected_stock FROM rm WHERE id=NEW.rm_id);
END$$

CREATE TRIGGER `excess_on_line_set_rm_stock`
BEFORE INSERT
ON requisition_excess_on_line FOR EACH ROW
BEGIN
	SET NEW.store_stock_before = (SELECT store_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.line_stock_before = (SELECT line_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.po_pending_stock_before = (SELECT po_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.po_rejected_stock_before = (SELECT po_rejected_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_pending_stock_before = (SELECT iqc_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_rejected_stock_before = (SELECT iqc_rejected_stock FROM rm WHERE id=NEW.rm_id);
END$$

CREATE TRIGGER `fg_manual_set_fg_stock`
BEFORE INSERT
ON fg_manual_update FOR EACH ROW
BEGIN
	SET NEW.store_stock_before = (SELECT store_stock FROM fg WHERE id=NEW.fg_id);
	SET NEW.oqc_pending_stock_before = (SELECT oqc_pending_stock FROM fg WHERE id=NEW.fg_id);
END$$

CREATE TRIGGER `production_set_fg_stock`
BEFORE INSERT
ON production FOR EACH ROW
BEGIN
	SET NEW.store_stock_before = (SELECT store_stock FROM fg WHERE id=NEW.fg_id);
	SET NEW.oqc_pending_stock_before = (SELECT oqc_pending_stock FROM fg WHERE id=NEW.fg_id);
END$$

CREATE TRIGGER `outwards_quality_check_set_stock`
BEFORE INSERT
ON outwards_quality_check FOR EACH ROW
BEGIN
	SET NEW.store_stock_before = (SELECT store_stock FROM fg WHERE id=NEW.fg_id);
	SET NEW.oqc_pending_stock_before = (SELECT oqc_pending_stock FROM fg WHERE id=NEW.fg_id);
END$$

CREATE TRIGGER `dispatch_set_stock`
BEFORE INSERT
ON dispatch FOR EACH ROW
BEGIN
	SET NEW.store_stock_before = (SELECT store_stock FROM fg WHERE id=NEW.fg_id);
	SET NEW.oqc_pending_stock_before = (SELECT oqc_pending_stock FROM fg WHERE id=NEW.fg_id);
END$$

DELIMITER ;