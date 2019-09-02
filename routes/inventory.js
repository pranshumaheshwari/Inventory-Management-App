var express 	   						 	 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js'),
		logger		  	 						 = require('../config/winston').inventory,
		app      	   							 = express.Router();

//=======================================================================================
//																		GET
//=======================================================================================

app.get("/inventory",async function(req,res){
	var q = "SELECT * FROM raw_material ORDER BY code";
	await selectQuery(q)
						.then(raw_materials => {
							res.render("inventory",{raw_materials:raw_materials,totalPrice:0,stock:0,storePrice:0,linePrice:0});
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

app.get("/inventory/bulkUpdate", async (req, res) => {
	var q = `SELECT * FROM raw_material ORDER BY code`;
	selectQuery(q)
			.then(data => {
				res.render("bulk_update", {data, type: 'inventory'});
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

app.get("/inventory/master",async (req,res) => {
	let q = `SELECT * FROM raw_material ORDER BY code`;
	let raw_materials = await selectQuery(q);
	res.render("inventory-master",{raw_materials: raw_materials});
});

app.get("/inventory/new",async function(req,res){
	var q = "SELECT code FROM supplier ORDER BY name";
	await selectQuery(q)
						.then(supplier_code => {
							res.render("new_raw_material",{supplier_code:supplier_code});
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

app.get("/inventory/:code",async function(req,res){
	var q = 'SELECT * FROM raw_material WHERE code = "' + req.params.code + '"';
	await selectQuery(q)
						.then(async raw_material => {
							q = "SELECT code FROM supplier ORDER BY name";
							await selectQuery(q)
												.then(supplier_code => {
													res.render("update_delete_raw_material",{raw_material:raw_material[0],supplier_code:supplier_code});
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

app.get("/inventory/:code/requirement",async function(req,res){
	var q = "SELECT Q.*,finished_goods.name FROM (SELECT * FROM finished_goods_detail WHERE raw_material_code ='" + req.params.code + "') AS Q INNER JOIN finished_goods ON Q.code = finished_goods.code";
	await selectQuery(q)
						.then(finished_goods => {
							res.render("raw_material_requirement",{finished_goods:finished_goods,raw:req.params.code});
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
//																		POST
//=======================================================================================

app.post("/inventory/search/category",async function(req,res){
	var q = "SELECT * FROM raw_material WHERE category = '" + req.body.category + "' ORDER BY code";
	await selectQuery(q)
						.then(raw_materials => {
							res.render("inventory",{raw_materials:raw_materials,totalPrice:0,storePrice:0,linePrice:0});
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

app.post("/inventory/search/name",async function(req,res){
	var q = "SELECT * FROM raw_material WHERE code = '" + req.body.name_code.split(",")[1] + "'";
	await selectQuery(q)
						.then(raw_material => {
							res.render("inventory",{raw_materials:raw_material,totalPrice:0,storePrice:0,linePrice:0});
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

app.post("/inventory/new",async function(req,res){
	var q = "INSERT INTO raw_material SET ?";
	await insertQuery(q, req.body.raw_material)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: req.body.raw_material,
								time: (new Date()).toISOString()
							});
							res.redirect("/inventory");
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

app.post("/inventory/bulkUpdate", async (req, res) => {
	var data = req.body.stock;
	var line_stock = req.body.line_stock
	for(const code in data) {
		let q = `SELECT stock, line_stock FROM raw_material WHERE code = '${code}'`
		let currentStock = await selectQuery(q)
									.then(f => f[0])
									.catch(err => {
										logger.error({
												error: err,
												where: `${ req.method } ${ req.url } ${ q }`,
												time: (new Date()).toISOString()
										});
										res.render('error',{error: err})
										res.end()
									});
		let store_error = parseFloat(data[code]) - parseFloat(currentStock.stock);
		let line_error = parseFloat(line_stock[code]) - parseFloat(currentStock.line_stock);
		q = `INSERT INTO raw_material_error SET ?`
		await insertQuery(q, {code, store_quantity: store_error, line_quantity: line_error})
					.then(resp => {
						logger.info({
							where: `${ req.method } ${ req.url } ${ q }`,
							time: (new Date()).toISOString()
						});
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
		q = `UPDATE raw_material SET stock = '${data[code]}', line_stock = '${line_stock[code]}' WHERE code = '${code}'`
		await selectQuery(q)
					.then(resp => {
						logger.info({
							where: `${ req.method } ${ req.url } ${ q }`,
							time: (new Date()).toISOString()
						});
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
	}
	res.redirect("/inventory")
});

//=======================================================================================
//																		PUT
//=======================================================================================

app.put("/inventory/:code",async function(req,res){
	var q = 'UPDATE raw_material SET ? WHERE code = "' + req.params.code + '"';
	await insertQuery(q, req.body.raw_material)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: req.body.raw_material,
								time: (new Date()).toISOString()
							});
							res.redirect("/inventory");
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

app.delete("/inventory/:code",async function(req,res){
	var q = `DELETE FROM raw_material WHERE code = "` + req.params.code + '"';
	await selectQuery(q)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: `Code: ${ req.params.code }`,
								time: (new Date()).toISOString()
							});
							res.redirect("/inventory");
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

module.exports = app;
