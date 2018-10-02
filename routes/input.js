var express 	   = require('express'),
	mysql 	  	   = require('mysql'),
	bodyParser 	   = require('body-parser'),
	methodOverride = require('method-override'),
	logger		  	 = require('../config/winston'),
	app      	  	 = express.Router();

var con = mysql.createConnection({
	host: "localhost",
  	user: "root",
  	password: "",
  	database: "Store"
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

app.get("/input",function(req,res){
	var q = "SELECT * FROM PO";
	con.query(q,function(err,POs){
		if(err){
			res.render("error");
		} else {
			var k=[];
			for(var i=0;i<POs.length;i++){
				if(POs[i].pending === "Open"){
					k.push(POs[i]);
				}
			}
			res.render("input",{POs:k});
		}
	});
});

app.post("/input",function(req,res){
	var q = 'SELECT P.*,r.price FROM (SELECT * FROM PO_detail WHERE  PO_code = "' + req.body.PO + '") AS P INNER JOIN raw_material AS r ON P.raw_desc = r.name';
	con.query(q,function(err,raw_materials){
		if(err)
			res.render("error");
		else {
			res.render("input_with_PO",{raw_materials : raw_materials});
		}
	});
});

app.post("/input/update",async function(req,res){
	var raw_desc = req.body.raw_desc;
	var DTPL_code = req.body.DTPL_code;
	var quantity = req.body.Quantity;
	var PO_code = req.body.PO_code;
	var invoice = req.body.invoice_no;
	var I = {};
	var q;
	for(var p=0;p<raw_desc.length;p++){
		I[raw_desc[p]] = [DTPL_code[p],quantity[p],invoice[p]];
	}
	for(var j=0;j<raw_desc.length;j++){
		q = 'UPDATE raw_material SET stock = stock + '+ quantity[j] + ' WHERE name ="' + raw_desc[j] + '"';
		await con.query(q,function(err){
			if(err){
				logger.error({
					level: 'error',
					message: {
						where: 'UPDATE raw_material stock',
						what: {
							PO_code: PO_code,
							desc: raw_desc[j],
							quantity: quantity[j]
						},
						time: Date.now()
					}
				});
				throw err;
			} else {
				logger.info({
					level: 'info',
					message: {
						where: 'UPDATE raw_material stock',
						what: {
							PO_code: PO_code,
							desc: raw_desc[j],
							quantity: quantity[j]
						},
						time: Date.now()
					}
				});
			}
		});
	}
	for(var i=0;i<raw_desc.length;i++){
		q = 'SELECT * FROM PO_detail WHERE PO_code ="' + PO_code + '" AND raw_desc ="' + raw_desc[i] + '"';
		con.query(q,function(err,raw_material){
			if(err)
				throw err;
			else {
				if(i == raw_desc.length)
					i = 0;
				var currentRemaining = raw_material[0].quantity;
				var finalRemaining = currentRemaining - quantity[i];
				q = 'UPDATE PO_detail SET quantity = ' + finalRemaining + ' WHERE PO_code = "' + PO_code + '" AND raw_desc = "' + raw_desc[i] + '" AND DTPL_code ="' + DTPL_code[i] + '"';
				con.query(q,function(err){
					if(err){
						logger.error({
							level: 'error',
							message: {
								where: 'UPDATE PO_detail quantity',
								what: {
									PO_code: PO_code,
									desc: raw_desc[i],
									quantity: quantity[i]
							},
							time: Date.now()
							}
						});
						throw err;
					} else {
						logger.info({
							level: 'info',
							message: {
								where: 'UPDATE PO_deatil quantity',
								what: {
									PO_code: PO_code,
									desc: raw_desc[i],
									quantity: quantity[i]
								},
								time: Date.now()
							}
						});
					}
				});
				i++;
			}
		});
	}
	for(var desc in I){
		q = "INSERT INTO input SET ?";
		var input = {
			PO_code: PO_code,
			invoice_no: I[desc][2],
			raw_desc: desc,
			DTPL_code: I[desc][0],
			quantity: I[desc][1]
		};
		con.query(q,input,function(err){
			if(err){
				logger.error({
					level: 'error',
					message: {
						where: 'INSERT INTO input',
						what: input,
						time: Date.now()
					}
				});
				throw err;
			} else {
				logger.info({
					level: 'info',
					message: {
						where: 'INSERT INTO input',
						what: input,
						time: Date.now()
					}
				});
			}
		});
	}
	// for(var i=0;i<raw_desc.length;i++){
	// 	if(i === raw_desc.length)
	// 		i = 0;
	// 	var q = 'SELECT * FROM raw_material WHERE name = "' + raw_desc[i] + '" AND DTPL_code ="' + DTPL_code[i] + '"';
	// 	con.query(q,function(err,raw_material){
	// 		if(err)
	// 			res.render("error");
	// 		else {
	// 			var currentStock = raw_material.stock;
	// 			var finalStock = parseInt(currentStock,10) + parseInt(quantity[i],10);
	// 			q = 'UPDATE raw_material SET stock = ' + finalStock + ' WHERE name = "' + raw_desc[i] + '" AND DTPL_code ="' + DTPL_code[i] + '"';
	// 			con.query(q,function(err){
	// 				if(err)
	// 					res.render("error");
	// 			});
	// 		}
	// 	});
	// 	i++;
	// }
	// for(var j=0;j<raw_desc.length;j++){
	// 	if(j === raw_desc.length)
	// 		j = 0;
	// 	var q = 'SELECT * FROM PO_detail WHERE PO_code ="' + PO_code + '"AND raw_desc ="' + raw_desc[j] + '" AND DTPL_code ="' + DTPL_code[j] + '"';
	// 	con.query(q,function(err,raw_material){
	// 		if(err)
	// 			res.render("error");
	// 		else {
	// 			var currentRemaining = raw_material[0].quantity;
	// 			var finalRemaining = currentRemaining - quantity[j];
	// 			q = 'UPDATE PO_detail SET quantity = ' + finalRemaining + ' WHERE PO_code = "' + PO_code + '" AND raw_desc = "' + raw_desc[j] + '" AND DTPL_code ="' + DTPL_code[j] + '"';
	// 			con.query(q,function(err){
	// 				if(err)
	// 					res.render("error");
	// 			});
	// 		}
	// 	});
	// 	j++;
	// }
		q = 'SELECT * FROM PO_detail WHERE PO_code ="' + PO_code + '"';
		con.query(q,function(err,raw_materials){
			var isFinished = true;
			for(var i=0;i<raw_materials.length;i++){
				if(raw_materials[i].quantity > 0)
					isFinished = false;
			}
			if(isFinished){
				q = 'UPDATE PO SET pending = "Closed" WHERE code = "' + PO_code + '"';
				con.query(q,function(err){
					if(err)
						throw err;
				});
			}
		});
		res.redirect("/input");
	// for(var k=0;k<raw_desc.length;k++){
	// 	if(k === raw_desc.length)
	// 		k = 0;
	// 	q = "INSERT INTO input SET ?";
	// 	var input = {
	// 		PO_code: PO_code,
	// 		invoice_no: invoice[k],
	// 		raw_desc: raw_desc[k],
	// 		DTPL_code: DTPL_code[k],
	// 		quantity: quantity[k]
	// 	};
	// 	con.query(q,input,function(err){
	// 		if(err)
	// 			res.render("error");
	// 	});
	// 	k++;
	// }
});

module.exports = app;
