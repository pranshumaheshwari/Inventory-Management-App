var express 	   = require('express'),
	mysql 	  	   = require('mysql'),
	bodyParser 	   = require('body-parser'),
	methodOverride = require('method-override'),
	app      	   = express.Router();

var con = mysql.createConnection({
	host: "localhost",
  	user: "root",
  	password: "",
  	database: "Store"
});

app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

app.get("/PO",function(req,res){
	var q = "SELECT * FROM PO";
	con.query(q,function(err,POs){
		if(err){
			res.render("error");
		} else {
			res.render("PO",{POs:POs});
		}
	});
});

app.get("/PO/new",function(req,res){
	var q = "SELECT * FROM raw_material";
	con.query(q,function(err,raw_materials){
		if(err){
			res.render("error");
		} else {
			var q = "SELECT * FROM supplier";
			con.query(q,function(err,suppliers){
				if(err){
					res.render("error");
				} else {
					res.render("new_PO",{suppliers:suppliers,raw_materials:raw_materials});
				}
			});
			}
	});
});

app.get("/PO/:code",function(req,res){
	var q = "SELECT * FROM PO_detail WHERE PO_code = '" + req.params.code + "'";
	con.query(q,function(err,foundRaw){
		if(err)
			res.render("error");
		else {
			q = "SELECT * FROM raw_material ORDER BY code"
			con.query(q,function(err,raw_materials){
				if(err)
					res.render("error");
				else {
					res.render("update_delete_PO",{raw_materials:raw_materials,foundRaw:foundRaw});
				}
			});
		}
	});
});

app.get("/PO/:code/delete",function(req,res){
	q = 'DELETE FROM PO_detail WHERE PO_code = "' + req.params.code + '"';
	con.query(q,function(err){
		if(err)
			res.render("error");
	});
	var q = 'DELETE FROM PO WHERE code = "' + req.params.code + '"';
	con.query(q,function(err){
		if(err)
			res.render("error");
	});
	res.redirect("/PO");
});

app.get("/PO/:code/new",function(req,res){
	var q = "SELECT * FROM raw_material ORDER BY name";
	con.query(q,function(err,raw_materials){
		if(err)
			res.render("error");
		else {
			q = "SELECT date FROM PO WHERE code ='" + req.params.code + "'";
			con.query(q,function(err,date){
				if(err)
					res.render("error");
				else {
					res.render("add_new_PO",{raw_materials:raw_materials,PO:req.params.code,date:date[0].date});
				}
			});
		}
	});
});

app.get("/PO/:code/close",function(req,res){
	var q = "UPDATE PO SET pending = 'Closed' WHERE code='" + req.params.code + "'";
	con.query(q,function(err){
		if(err)
			res.render("error");
		res.redirect("/PO");
	});
});

app.get("/PO/:code/:raw_code/delete",function(req,res){
	var q = "DELETE FROM PO_detail WHERE PO_code ='" + req.params.code + "' AND raw_desc ='" + req.params.raw_code + "'";
	con.query(q,function(err){
		if(err)
			res.render("error");
		else {
			res.redirect("/PO/" + req.params.code);
		}
	});
});

app.post("/PO/export",function(req,res){
	res.render("export",{data:req.body,mock:false});
});

app.post("/PO/new",function(req,res){
	var q = "INSERT INTO PO SET ?",
		PO_no = req.body.PO.code,
		supplier_code = req.body.PO.supplier_code.split(","),
		supplier_name = supplier_code[0],
		product_code = req.body.product_code,
		product_name = req.body.product_name,
		date = req.body.PO.date,
		initial_quantity = req.body.quantity,
		product_DTPL_code = req.body.product_DTPL_code,
		quantity = req.body.quantity;
	supplier_code = supplier_code[1];
	var PO = {
		code : PO_no,
		supplier_code: supplier_code,
		date: date,
		pending: "Open"
	}
	con.query(q,PO,function(err){
		if(err)
			res.render("error");
	});
	setTimeout(function(){},1000);
	q = "INSERT INTO PO_detail SET ?";
	var PO_obj;
	for(var i=0; i<quantity.length; i++){
		let ii = i;
		PO_obj = {
			PO_code: PO_no,
			date: date,
			quantity: quantity[ii],
			initial_quantity: quantity[ii],
			DTPL_code: product_DTPL_code[ii],
			raw_desc: product_name[ii],
			no: ii
		};
		con.query(q,PO_obj,function(err){
			if(err)
				res.render("error");
		});
	};
	res.redirect("/PO");
});

app.post("/PO/:code/update",function(req,res){
	var raw = req.body.PO_code;
	var PO_no = req.body.PO_no;
	var date = req.body.PO_date;
	for(var i=0;i<raw.length;i++){
		q = "UPDATE PO_detail SET ? WHERE PO_code ='" + PO_no + "' AND no = " + i;
		var PO = {
			PO_code: PO_no,
			date: date,
			raw_desc: raw[i].split("$")[0],
			DTPL_code: raw[i].split("$")[1],
			quantity: req.body.PO_quantity[i],
			no: i
		}
		con.query(q,PO,function(err){
			if(err)
				res.render("error");
		});
	}
	res.redirect("/PO");
});

app.post("/PO/:code/new",function(req,res){
	var q = "SELECT COUNT(*)  AS count FROM PO_detail WHERE PO_code = '" + req.params.code + "'";
	var no;
	con.query(q,function(err,coun){
		if(err)
			throw err;
		else {
			no = coun[0].count;
		}
	});
	setTimeout(function(){
		q = "INSERT INTO PO_detail SET ?";
		var quantity = req.body.quantity;
		var raw = req.body.raw.split("$");
		var PO = {
			PO_code: req.body.PO_no,
			date: req.body.date,
			raw_desc: raw[0],
			DTPL_code: raw[1],
			quantity: quantity,
			initial_quantity: quantity,
			no: no
		}
		console.log(PO);
		con.query(q,PO,function(err){
			if(err)
				throw err;
			else {
				res.redirect("/PO/"+req.params.code);
			}
		});
	},2000);
});

app.post("/PO/generate",function(req,res){
	// ADD RAW_MATERIAL MONTHLY REQUIREMENT
	var POFull = req.body.PO;
	var Supplier = req.body.supplier;
	var PO = [], supplier = [];
	var raw = req.body.raw_name;
	var DTPL_code = req.body.DTPL_code;
	var quantity = req.body.quantity;
	var z = 0, lastPO;
	for(var k=0;k<POFull.length;k++){
		if(quantity[k] === 0 || POFull[k] === ""){
			continue;
		}
		if(lastPO != POFull[k])
			z=0;
		else
			z++;
		if(PO.indexOf(POFull[k]) === -1){
			PO.push(POFull[k]);
			supplier.push(Supplier[k]);
		}
		lastPO = POFull[k];
		q = "INSERT INTO PO_detail SET ?";
		var po = {
			PO_code: POFull[k],
			date: new Date().toISOString().substring(0,10),
			raw_desc: raw[k],
			quantity: quantity[k],
			initial_quantity: quantity[k],
			no: z,
			DTPL_code: DTPL_code[k]
		}
		con.query(q,po,function(err){
			if(err)
				res.render("error");
		});
	}
	for(var k=0;k<PO.length;k++){
		q = "INSERT INTO PO SET ?";
		var po = {
			code: PO[k],
			supplier_code: supplier[k],
			date: new Date().toISOString().substring(0,10),
			pending: "Open"
		}
		con.query(q,po,function(err){
			if(err)
				res.render("error");
		});
	}
	setTimeout(function(){
		res.redirect("/PO");
	},1000);
});

module.exports = app;
