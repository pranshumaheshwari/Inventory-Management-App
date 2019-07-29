USE store;

CREATE TABLE IF NOT EXISTS users(
	username VARCHAR(100) PRIMARY KEY,
	password VARCHAR(50) NOT NULL,
	type VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS finished_goods_error(
	code varchar(14) NOT NULL,
	quantity FLOAT NOT NULL,
	date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raw_material_error(
	code varchar(10) NOT NULL,
	quantity FLOAT NOT NULL,
	date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raw_material(
	code VARCHAR(10) PRIMARY KEY,
	name VARCHAR(100) NOT NULL UNIQUE,
	DTPL_code VARCHAR(25),
	supplier_code VARCHAR(10) NOT NULL,
	category VARCHAR(11) NOT NULL,
	unit VARCHAR(10) NOT NULL,
	price DECIMAL(6,2) NOT NULL,
	stock INT NOT NULL,
	line_stock FLOAT NOT NULL,
	monthly_requirement INT
);

CREATE TABLE IF NOT EXISTS finished_goods(
	customer varchar(40),
	code varchar(14) PRIMARY KEY,
	name varchar(48) NOT NULL,
	quantity int(11),
	stock int(11) NOT NULL DEFAULT 0,
	category varchar(15) NOT NULL,
	price FLOAT NOT NULL DEFAULT 0.0,
	man_power FLOAT NOT NULL DEFAULT 0,
	overheads FLOAT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS finished_goods_detail(
	code VARCHAR(14) NOT NULL,
	raw_material_code VARCHAR(7) NOT NULL,
	quantity DECIMAL(15,3) NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance(
	date DATETIME NOT NULL,
	nos INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS supplier (
	code varchar(11) PRIMARY KEY,
	name varchar(40) NOT NULL,
	address1 varchar(47),
	address2 varchar(34),
	city varchar(10) NOT NULL,
	state varchar(11) NOT NULL,
	GST_no varchar(16) NOT NULL,
	PAN_no varchar(10)
);

CREATE TABLE IF NOT EXISTS PO(
	code INT NOT NULL,
	supplier_code VARCHAR(10) NOT NULL,
	date DATETIME NOT NULL,
	pending ENUM('Open','Closed')
);
CREATE TABLE IF NOT EXISTS PO_detail(
	PO_code INT NOT NULL,
	date DATETIME NOT NULL,
	quantity DOUBLE NOT NULL,
	no INT,
	raw_desc VARCHAR(100),
	DTPL_code VARCHAR(25),
	initial_quantity DOUBLE NOT NULL
);
CREATE TABLE IF NOT EXISTS input(
	PO_code INT NOT NULL,
	invoice_no VARCHAR(50) NOT NULL,
	DTPL_code VARCHAR(20),
	raw_desc VARCHAR(200),
	quantity DOUBLE NOT NULL,
	date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS output(
	slip_no VARCHAR(10) NOT NULL,
	raw_material_code VARCHAR(10),
	quantity DOUBLE NOT NULL,
	date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS production(
	FG_code VARCHAR(50),
	date DATETIME DEFAULT CURRENT_TIMESTAMP,
	date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
	quantity INT
);
CREATE TABLE IF NOT EXISTS dispatch(
	FG_code VARCHAR(50),
	date DATETIME DEFAULT CURRENT_TIMESTAMP,
	date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
	quantity INT,
	invoice_no VARCHAR(15)
);
