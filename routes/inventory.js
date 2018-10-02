var express 	   						 = require('express'),
	{selectQuery, insertQuery} = require('../config/query.js')
	bodyParser 	   						 = require('body-parser'),
	methodOverride 						 = require('method-override'),
	logger		  	 						 = require('../config/winston').inventory,
	app      	   							 = express.Router();

//=======================================================================================

app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

//=======================================================================================
//																		GET
//=======================================================================================

app.get("/inventory",async function(req,res){
	var q = "SELECT * FROM raw_material ORDER BY code";
	selectQuery(q)
						.then(raw_materials => {
							res.render("inventory",{raw_materials:raw_materials,totalPrice:0,stock:0});
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `GET ${ req.url } ${ q }`,
									time: Date.now().toString()
							});
							res.render('error',{error: err})
						});
});

app.get("/inventory/new",async function(req,res){
	var q = "SELECT code FROM supplier ORDER BY name";
	selectQuery(q)
						.then(supplier_code => {
							res.render("new_raw_material",{supplier_code:supplier_code});
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `GET ${ req.url } ${ q }`,
									time: Date.now().toString()
							});
							res.render('error',{error: err});
						});
});

app.get("/inventory/:code",async function(req,res){
	var q = 'SELECT * FROM raw_material WHERE code = "' + req.params.code + '"';
	selectQuery(q)
						.then(raw_material => {
							q = "SELECT code FROM supplier ORDER BY name";
							selectQuery(q)
												.then(supplier_code => {
													res.render("update_delete_raw_material",{raw_material:raw_material[0],supplier_code:supplier_code});
												})
												.catch(err => {
													logger.error({
															error: err,
															where: `GET ${ req.url } ${ q }`,
															time: Date.now().toString()
													});
													res.render('error',{error: err});
												});
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `GET ${ req.url } ${ q }`,
									time: Date.now().toString()
							});
							res.render('error',{error: err});
						});
});

app.get("/inventory/:code/requirement",async function(req,res){
	var q = "SELECT Q.*,finished_goods.name FROM (SELECT * FROM finished_goods_detail WHERE raw_material_code ='" + req.params.code + "') AS Q INNER JOIN finished_goods ON Q.code = finished_goods.code";
	selectQuery(q)
						.then(finished_goods => {
							res.render("raw_material_requirement",{finished_goods:finished_goods,raw:req.params.code});
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `GET ${ req.url } ${ q }`,
									time: Date.now().toString()
							});
							res.render('error',{error: err});
						});
});

//=======================================================================================
//																		POST
//=======================================================================================

app.post("/inventory/search/category",async function(req,res){
	var q = "SELECT * FROM raw_material WHERE category = '" + req.body.category + "' ORDER BY code";
	selectQuery(q)
						.then(raw_materials => {
							res.render("inventory",{raw_materials:raw_materials,totalPrice:0});
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `POST ${ req.url } ${ q }`,
									time: Date.now().toString()
							});
							res.render('error',{error: err});
						});
});

app.post("/inventory/search/name",async function(req,res){
	var q = "SELECT * FROM raw_material WHERE code = '" + req.body.name_code.split(",")[1] + "'";
	selectQuery(q)
						.then(raw_material => {
							res.render("inventory",{raw_materials:raw_material,totalPrice:0});
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `POST ${ req.url } ${ q }`,
									time: Date.now().toString()
							});
							res.render('error',{error: err});
						});
});

app.post("/inventory/new",async function(req,res){
	var q = "INSERT INTO raw_material SET ?";
	insertQuery(q, req.body.raw_material)
						.then(result => {
							logger.info({
								where: `POST ${ req.url } ${ q }`,
								what: req.body.raw_material
							});
							res.redirect("/inventory");
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `POST ${ req.url } ${ q }`,
									time: Date.now().toString()
							});
							res.render('error',{error: err});
						});
});

//=======================================================================================
//																		PUT
//=======================================================================================

app.put("/inventory/:code",async function(req,res){
	var q = 'UPDATE raw_material SET ? WHERE code = "' + req.params.code + '"';
	insertQuery(q, req.body.raw_material)
						.then(result => {
							logger.info({
								where: `PUT ${ req.url } ${ q }`,
								what: req.body.raw_material
							});
							res.redirect("/inventory");
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `PUT ${ req.url } ${ q }`,
									time: Date.now().toString()
							});
							res.render('error',{error: err});
						});
});

//=======================================================================================
//																		DELETE
//=======================================================================================

app.delete("/inventory/:code",async function(req,res){
	var q = 'DELETE FROM raw_material WHERE code = "' + req.params.code + '"';
	selectQuery(q)
						.then(raw_material => {
							logger.info({
								where: `DELETE ${ req.url } ${ q }`,
								what: `Code: ${ req.params.code }`
							});
							res.redirect("/inventory");
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `DELETE ${ req.url } ${ q }`,
									time: Date.now().toString()
							});
							res.render('error',{error: err});
						});
});

//=======================================================================================

module.exports = app;
