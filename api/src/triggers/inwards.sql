DELIMITER $$

CREATE TRIGGER `insert_stock_po_inwards` 
BEFORE INSERT 
ON po_inwards FOR EACH ROW
BEGIN
	SET NEW.store_stock_before = (SELECT store_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_pending_stock_before = (SELECT iqc_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.line_stock_before = (SELECT line_stock FROM rm WHERE id=NEW.rm_id);
END$$

CREATE TRIGGER `update_stock_po_inwards` 
AFTER INSERT 
ON po_inwards FOR EACH ROW
BEGIN
	UPDATE rm SET iqc_pending_stock = iqc_pending_stock + NEW.quantity WHERE id = NEW.rm_id;
	UPDATE invoice_inwards SET status = "IQC" WHERE supplier_id = NEW.supplier_id AND invoice_number = NEW.invoice_number;
END$$


CREATE TRIGGER `insert_stock_iqc_inwards` 
BEFORE INSERT 
ON iqc_inwards FOR EACH ROW
BEGIN
	SET NEW.store_stock_before = (SELECT store_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.iqc_pending_stock_before = (SELECT iqc_pending_stock FROM rm WHERE id=NEW.rm_id);
	SET NEW.line_stock_before = (SELECT line_stock FROM rm WHERE id=NEW.rm_id);
END$$

CREATE TRIGGER `update_stock_iqc_inwards` 
AFTER INSERT 
ON iqc_inwards FOR EACH ROW
BEGIN
	UPDATE rm SET iqc_pending_stock = iqc_pending_stock - NEW.quantity, store_stock = store_stock + NEW.quantity WHERE id = NEW.rm_id;
	UPDATE invoice_inwards SET status = "IN" WHERE supplier_id = NEW.supplier_id AND invoice_number = NEW.invoice_number;
	UPDATE po_inwards SET status = "IN" WHERE supplier_id = NEW.supplier_id AND invoice_number = NEW.invoice_number AND rm_id = NEW.rm_id;
END$$

DELIMITER ;