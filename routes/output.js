var express 	   							 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js')
		bodyParser 	   						 = require('body-parser'),
		methodOverride  					 = require('method-override'),
		logger    	    					 = require('../config/winston').output,
		app      		    					 = express.Router();

//=======================================================================================

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

//=======================================================================================
//																		GET
//=======================================================================================

app.get("/output",function(req,res){
	var q = "SELECT * FROM raw_material";
	selectQuery(q)
						.then(raw_materials => {
							res.render("output",{raw_materials:raw_materials});
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

app.post("/output",function(req,res){
	for(var i=0;i<req.body.product_code.length;i++){
		let o = {
			slip_no: req.body.slip_no[0],
			raw_material_code: req.body.product_code[i],
			quantity: req.body.Quantity[i]
		}
		var q = "INSERT INTO output SET ?";
		insertQuery(q, o)
							.then(result => {
								logger.info({
									where: `${ req.method } ${ req.url } ${ q }`,
									what: o,
									time: Date.now().toString()
								});
								q = "UPDATE raw_material SET stock = stock - " + o.quantity + ", line_stock = line_stock + " + o.quantity + " WHERE code = '" + o.raw_material_code + "'";
								selectQuery(q)
													.then(raw_materials => {
														logger.info({
															where: `${ req.method } ${ req.url } ${ q }`,
															what: o,
															time: Date.now().toString()
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
								res.render('error',{error: err});
							});
	}
	res.redirect("/output");
});

module.exports = app;
