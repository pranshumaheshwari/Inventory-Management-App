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
	no INT,
	raw_desc VARCHAR(100),
	DTPL_code VARCHAR(25),
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
	slip_no VARCHAR(10) NOT NULL,
	raw_material_code VARCHAR(10),
	quantity DOUBLE NOT NULL,
	date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE production(
	FG_code VARCHAR(50),
	date DATETIME DEFAULT CURRENT_TIMESTAMP,
	quantity INT
);
CREATE TABLE dispatch(
	FG_code VARCHAR(50),
	date DATETIME DEFAULT CURRENT_TIMESTAMP,
	quantity INT,
	invoice_no VARCHAR(15)
);
