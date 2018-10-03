var express 	   							 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js'),
		bodyParser 	   						 = require('body-parser'),
		methodOverride 						 = require('method-override'),
		logger		  	 						 = require('../config/winston').input,
		app      	  	 						 = express.Router();

//=======================================================================================

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

//=======================================================================================
//																		GET
//=======================================================================================

app.get("/input",function(req,res){
	var q = "SELECT * FROM PO";
	selectQuery(q)
						.then(POs => {
							POs = POs.filter(PO => PO.pending === 'Open');
							res.render("input",{POs:POs});
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: Date.now().toString()
							});
							res.render('error',{error: err})
						});
});

//=======================================================================================
//																		POST
//=======================================================================================

app.post("/input",function(req,res){
	var q = 'SELECT P.*,r.price FROM (SELECT * FROM PO_detail WHERE  PO_code = "' + req.body.PO + '") AS P INNER JOIN raw_material AS r ON P.raw_desc = r.name';
	selectQuery(q)
						.then(POs => {
							res.render("input_with_PO",{raw_materials : raw_materials});
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: Date.now().toString()
							});
							res.render('error',{error: err})
						});
});

app.post("/input/update",async function(req,res){
	var raw_desc = req.body.raw_desc;
	var DTPL_code = req.body.DTPL_code;
	var quantity = req.body.Quantity;
	var PO_code = req.body.PO_code;
	var invoice = req.body.invoice_no;
	for(var i=0;i<raw_desc.length;i++){
		let q = 'UPDATE raw_material SET stock = stock + ' + quantity[i] + ' WHERE name ="' + raw_desc[i] + '"';
		selectQuery(q)
							.then(result => {
								logger.info({
									where: `${ req.method } ${ req.url } ${ q }`,
									time: Date.now().toString()
								});
								q = 'UPDATE PO_detail SET quantity = quantity - ' + quantity[i] + ' WHERE PO_code = "' + PO_code + '" AND raw_desc = "' + raw_desc[i] + '" AND DTPL_code ="' + DTPL_code[i] + '"';
								selectQuery(q)
													.then(result => {
														logger.info({
															where: `${ req.method } ${ req.url } ${ q }`,
															time: Date.now().toString()
														});
														q = "INSERT INTO input SET ?";
														var input = {
															PO_code: PO_code,
															invoice_no: invoice[i],
															raw_desc: raw_desc[i],
															DTPL_code: DTPL_code[i],
															quantity: quantity[i]
														};
														insertQuery(q, input)
																			.then(result => {
																				logger.info({
																					where: `${ req.method } ${ req.url } ${ q }`,
																					what: req.body.raw_material,
																					time: Date.now().toString()
																				});
																			})
																			.catch(err => {
																				logger.error({
																						error: err,
																						where: `${ req.method } ${ req.url } ${ q }`,
																						time: Date.now().toString()
																				});
																				res.render('error',{error: err});
																			});
													})
													.catch(err => {
														logger.error({
																error: err,
																where: `${ req.method } ${ req.url } ${ q }`,
																time: Date.now().toString()
														});
														res.render('error',{error: err})
													});
							})
							.catch(err => {
								logger.error({
										error: err,
										where: `${ req.method } ${ req.url } ${ q }`,
										time: Date.now().toString()
								});
								res.render('error',{error: err})
							});
	}
	// let q = 'SELECT * FROM PO_detail WHERE PO_code ="' + PO_code + '"';
	// con.query(q,function(err,raw_materials){
	// 	var isFinished = true;
	// 	for(var i=0;i<raw_materials.length;i++){
	// 		if(raw_materials[i].quantity > 0)
	// 			isFinished = false;
	// 	}
	// 	if(isFinished){
	// 		q = 'UPDATE PO SET pending = "Closed" WHERE code = "' + PO_code + '"';
	// 		con.query(q,function(err){
	// 			if(err)
	// 				throw err;
	// 		});
	// 	}
	// });
	res.redirect("/input");
});

module.exports = app;
