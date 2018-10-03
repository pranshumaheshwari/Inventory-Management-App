var express 	  							 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js'),
		bodyParser 	  						 = require('body-parser'),
		methodOverride 						 = require('method-override'),
		logger		  	 						 = require('../config/winston').supplier,
		app      	   							 = express.Router();

//=======================================================================================

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

//=======================================================================================
//																		GET
//=======================================================================================

app.get("/supplier",function(req,res){
	var q = "SELECT * FROM supplier ORDER BY name";
	selectQuery(q)
						.then(suppliers => {
							res.render("supplier",{suppliers:suppliers});
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

app.get("/supplier/new",function(req,res){
	res.render("new_supplier");
});

app.get("/supplier/:code",function(req,res){
	var q = 'SELECT * FROM supplier WHERE code = "' + req.params.code + '"';
	selectQuery(q)
						.then(supplier => {
							res.render("update_delete_supplier",{supplier:supplier[0]});
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

app.post("/supplier/new",function(req,res){
	var q = "INSERT INTO supplier SET ?";
	insertQuery(q, req.body.supplier)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: req.body.supplier,
								time: Date.now().toString()
							});
							res.redirect("/supplier");
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: Date.now().toString()
							});
							res.render('error',{error: err});
						});
});

//=======================================================================================
//																		PUT
//=======================================================================================

app.put("/supplier/:code",function(req,res){
	var q = 'UPDATE supplier SET ? WHERE code = "' + req.params.code + '"';
	insertQuery(q, req.body.supplier)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: req.body.supplier,
								time: Date.now().toString()
							});
							res.redirect("/supplier");
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: Date.now().toString()
							});
							res.render('error',{error: err});
						});
});

//=======================================================================================
//																		DELETE
//=======================================================================================

app.delete("/supplier/:code",function(req,res){
	var q = 'DELETE FROM supplier WHERE code = "' + req.params.code + '"';
	selectQuery(q)
						.then(result => {
							res.redirect("/supplier");
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

module.exports = app;
