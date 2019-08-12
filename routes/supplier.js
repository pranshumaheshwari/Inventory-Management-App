var express 	  							 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js'),
		logger		  	 						 = require('../config/winston').supplier,
		app      	   							 = express.Router();

//=======================================================================================
//																		GET
//=======================================================================================

app.get("/supplier",async function(req,res){
	var q = "SELECT * FROM supplier ORDER BY name";
	await selectQuery(q)
						.then(data => {
							res.render("supplier&customer",{data, type: "supplier"});
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err})
							res.end()
						});
});

app.get("/customer", async (req, res) => {
	var q = "SELECT * FROM customer ORDER BY name";
	await selectQuery(q)
					.then(data => {
						res.render("supplier&customer",{data, type: "customer"});
					})
					.catch(err => {
						logger.error({
								error: err,
								where: `${ req.method } ${ req.url } ${ q }`,
								time: (new Date()).toISOString()
						});
						res.render('error',{error: err})
						res.end()
					});
})

app.get("/supplier/new",async function(req,res){
	res.render("new_supplier&customer", {type: "supplier"});
});

app.get("/customer/new",async function(req,res){
	res.render("new_supplier&customer", {type: "customer"});
});

app.get("/supplier/:code",async function(req,res){
	var q = 'SELECT * FROM supplier WHERE code = "' + req.params.code + '"';
	await selectQuery(q)
					.then(supplier => {
						res.render("update_delete_supplier&customer",{data:supplier[0], type: "supplier"});
					})
					.catch(err => {
						logger.error({
								error: err,
								where: `${ req.method } ${ req.url } ${ q }`,
								time: (new Date()).toISOString()
						});
						res.render('error',{error: err})
						res.end()
					});
});

app.get("/customer/:code",async function(req,res){
	var q = 'SELECT * FROM customer WHERE code = "' + req.params.code + '"';
	await selectQuery(q)
					.then(customer => {
						res.render("update_delete_supplier&customer",{data:customer[0], type: "customer"});
					})
					.catch(err => {
						logger.error({
								error: err,
								where: `${ req.method } ${ req.url } ${ q }`,
								time: (new Date()).toISOString()
						});
						res.render('error',{error: err})
						res.end()
					});
});

//=======================================================================================
//																		POST
//=======================================================================================

app.post("/supplier/new",async function(req,res){
	var q = "INSERT INTO supplier SET ?";
	await insertQuery(q, req.body.data)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: req.body.data,
								time: (new Date()).toISOString()
							});
							res.redirect("/supplier");
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err});
							res.end()
						});
});

app.post("/customer/new",async function(req,res){
	var q = "INSERT INTO customer SET ?";
	await insertQuery(q, req.body.data)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: req.body.data,
								time: (new Date()).toISOString()
							});
							res.redirect("/customer");
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err});
							res.end()
						});
});

//=======================================================================================
//																		PUT
//=======================================================================================

app.put("/supplier/:code",async function(req,res){
	var q = 'UPDATE supplier SET ? WHERE code = "' + req.params.code + '"';
	await insertQuery(q, req.body.data)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: req.body.data,
								time: (new Date()).toISOString()
							});
							res.redirect("/supplier");
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err});
							res.end()
						});
});

app.put("/customer/:code",async function(req,res){
	var q = 'UPDATE customer SET ? WHERE code = "' + req.params.code + '"';
	await insertQuery(q, req.body.data)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: req.body.data,
								time: (new Date()).toISOString()
							});
							res.redirect("/customer");
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err});
							res.end()
						});
});

//=======================================================================================
//																		DELETE
//=======================================================================================

app.delete("/supplier/:code",async function(req,res){
	var q = 'DELETE FROM supplier WHERE code = "' + req.params.code + '"';
	await selectQuery(q)
						.then(result => {
							res.redirect("/supplier");
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err})
							res.end()
						});
});

app.delete("/customer/:code",async function(req,res){
	var q = 'DELETE FROM customer WHERE code = "' + req.params.code + '"';
	await selectQuery(q)
						.then(result => {
							res.redirect("/customer");
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err})
							res.end()
						});
});

module.exports = app;
