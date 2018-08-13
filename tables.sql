CREATE TABLE PO(
	code INT NOT NULL,
	supplier_code VARCHAR(10) NOT NULL,
	date DATETIME NOT NULL,
	pending ENUM('Open','Closed')
);
CREATE TABLE PO_detail(
	PO_code INT NOT NULL,
	date DATETIME NOT NULL,
	quantity DOUBLE NOT NULL,
	raw_material_code VARCHAR(10),
	initial_quantity DOUBLE NOT NULL
);
CREATE TABLE input(
	PO_code INT NOT NULL,
	invoice_no VARCHAR(50) NOT NULL,
	DTPL_code VARCHAR(20),
	raw_desc VARCHAR(200),
	quantity DOUBLE NOT NULL,
	date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE output(
	slip_no INT NOT NULL,
	raw_material_code VARCHAR(10),
	quantity DOUBLE NOT NULL,
	date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);