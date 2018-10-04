var express 	   						 	 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js'),
		bodyParser 	   						 = require('body-parser'),
		methodOverride 						 = require('method-override'),
		logger		  	 						 = require('../config/winston').finished_good,
		app      	   							 = express.Router();

//=======================================================================================

app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

//=======================================================================================
//																		GET
//=======================================================================================

app.get("/BOM",function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY category";
	selectQuery(q)
						.then(finishedGoods => {
							res.render("BOM",{finishedGoods:finishedGoods,mock:false});
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

app.get("/finished_good",function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY category";
	selectQuery(q)
						.then(finished_goods => {
							res.render("finished_good",{finished_goods:finished_goods});
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

app.get("/finished_good/new",function(req,res){
	var q = "SELECT * FROM raw_material ORDER BY name";
	selectQuery(q)
						.then(raw_materials => {
							res.render("new_finished_good",{raw_materials:raw_materials});
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

app.get("/finished_good/mock",function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY code";
	selectQuery(q)
						.then(finished_goods => {
							res.render("BOM",{finishedGoods:finished_goods,mock:true});
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

app.get("/finished_good/reset",function(req,res){
	var q = "UPDATE finished_goods SET quantity = 0";
	selectQuery(q)
						.then(result => {
							res.redirect("/finished_good");
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

app.get("/finished_good/create",function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY code";
	selectQuery(q)
						.then(finished_goods => {
							res.render("input_finished_good",{finished_goods:finished_goods});
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

app.get("/finished_good/PD",function(req,res){
	res.render("PD");
});

app.get("/finished_good/dispatch",function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY code";
	selectQuery(q)
						.then(finished_goods => {
							res.render("dispatch",{finished_goods:finished_goods});
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

app.get("/finished_good/:code",function(req,res){
	var q = "SELECT * FROM finished_goods WHERE code='" + req.params.code + "'";
	selectQuery(q)
						.then(finished_good => {
							q = "SELECT * FROM finished_goods_detail WHERE code='" + req.params.code + "' ORDER BY raw_material_code";
							selectQuery(q)
												.then(raw_materials => {
													q = "SELECT * FROM raw_material";
													selectQuery(q)
																		.then(raw => {
																			res.render("update_delete_finished_good",{finished_good:finished_good[0],raw_materials:raw_materials,raw:raw});
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

app.get("/finished_good/BOM/:code",function(req,res){
	var q = "SELECT name FROM finished_goods WHERE code ='" + req.params.code + "'";
	selectQuery(q)
						.then(name => {
							name = name[0].name;
							q = "SELECT f.*,r.name,r.stock FROM (SELECT * FROM finished_goods_detail WHERE code='" + req.params.code + "') AS f INNER JOIN raw_material AS r ON r.code = f.raw_material_code ORDER BY f.raw_material_code";
							selectQuery(q)
												.then(raw_materials => {
													res.render("FG_BOM",{raw_materials:raw_materials,code:req.params.code,name:name});
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
});

app.get("/finished_good/:code/new",function(req,res){
	var q = "SELECT * FROM raw_material";
	selectQuery(q)
						.then(raw => {
							res.render("new_raw_finished_good",{raw:raw,code:req.params.code});
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

// NOT WORKING!!!
app.post("/BOM",async function(req,res){
	// var q = "UPDATE raw_material SET monthly_requirement = 0";
	// selectQuery(q)
	// 					.then(result => {
	// 						res.render("new_raw_finished_good",{raw:raw,code:req.params.code});
	// 					})
	// 					.catch(err => {
	// 						logger.error({
	// 								error: err,
	// 								where: `${ req.method } ${ req.url } ${ q }`,
	// 								time: Date.now().toString()
	// 						});
	// 						res.render('error',{error: err})
	// 					});
	var raw_quantity = {};
	const caclulateRequirement = async(i) => {
		var q = "SELECT * FROM finished_goods_detail WHERE code='" + req.body.finished_code[i] + "'";
		selectQuery(q)
							.then(raw_materials => {
								raw_materials.forEach(raw_material => {
									raw_quantity[raw_material.raw_material_code] += raw_material.quantity * req.body.quantity[i];
								});
								return new Promise((resolve,reject) => resolve());
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
	var q = "SELECT * FROM raw_material";
	selectQuery(q)
						.then(raw_materials => {
							for(var k=0;k<raw_materials.length;k++){
								raw_quantity[raw_materials[k].code] = 0;
							}
							for(var i=0;i<req.body.finished_code.length;i++){
								var q = "UPDATE finished_goods SET quantity ='" + req.body.quantity[i] + "' WHERE code ='" + req.body.finished_code[i] + "'";
								selectQuery(q)
													.then(async(result) => {
														try {
															await caclulateRequirement(i);
														} catch (err) {
															logger.error({
																	error: err,
																	where: `${ req.method } ${ req.url } ${ q }`,
																	time: Date.now().toString()
															});
															res.render('error',{error: err})
														}
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
							q = "SELECT * FROM raw_material ORDER BY supplier_code ";
							selectQuery(q)
												.then(async(raw_materials) => {
													await raw_materials.forEach(raw => {
														raw.monthly_requirement = raw_quantity[raw.code];
													});
													let r = raw_materials.filter(raw => raw.monthly_requirement > 0 );
													res.render("BOM_manual",{raw_materials:r,w:0,mock:false});
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
	// q = "SELECT * FROM raw_material";
	// con.query(q,function(err,raw_materials){
	// 	if(err)
	// 		res.render("error");
	// 	else {
	// 		for(var k=0;k<raw_materials.length;k++){
	// 			raw_quantity[raw_materials[k].code] = 0;
	// 			if(k === raw_materials.length - 1){
	// 				q = "SELECT * FROM finished_goods ORDER BY code";
	// 				con.query(q,function(err,finishedGoods){
	// 					if(err)
	// 						res.render("error");
	// 					else {
	// 						for(var i=0;i<finishedGoods.length;i++){
	// 							q = "SELECT * FROM finished_goods_detail WHERE code='" + finishedGoods[i].code + "'";
	// 							con.query(q,function(err,raw_materials){
	// 								if(err)
	// 									res.render("error");
	// 								else {
	// 									if(i === finishedGoods.length)
	// 										i = 0;
	// 									for(var j=0;j<raw_materials.length;j++){
	// 										var raw_q = finishedGoods[i].quantity * raw_materials[j].quantity;
	// 										raw_quantity[raw_materials[j].raw_material_code] += raw_q;
	// 									}
	// 									i++;
	// 								}
	// 							});
	// 							if(i === finishedGoods.length-1){
	// 								setTimeout(function(){
	// 									q = "SELECT * FROM raw_material";
	// 									con.query(q,function(err,raw_materials){
	// 										if(err)
	// 											res.render("error");
	// 										else {
	// 											for(var i=0;i<raw_materials.length;i++){
	// 												q = "UPDATE raw_material SET monthly_requirement = '" + raw_quantity[raw_materials[i].code] + "' WHERE code='" + raw_materials[i].code + "'";
	// 												con.query(q,function(err){
	// 													if(err)
	// 														res.render("error");
	// 												});
	// 											}
	// 										}
	// 									});
	// 									setTimeout(function(){
	// 										q = "SELECT * FROM raw_material ORDER BY supplier_code ";
	// 										con.query(q,function(err,raw_materials){
	// 										if(err)
	// 											res.render("error");
	// 										var r = [];
	// 										for(var p=0;p<raw_materials.length;p++){
	// 											if(raw_materials[p].monthly_requirement > 0){
	// 												r.push(raw_materials[p]);
	// 											}
	// 										}
	// 										res.render("BOM_manual",{raw_materials:r,w:0,mock:false});
	// 										});
	// 									},3000);
	// 								},3000);
	// 							}
	// 						}
	// 					}
	// 				});
	// 			}
	// 		}
	// 	}
	// });
});

app.post("/finished_good/dispatch",function(req,res){
	for(var i=0;i<product.length;i++){
		var q = "UPDATE finished_goods SET stock = stock - " + req.body.quantity[i] + " WHERE code ='" + req.body.product[i] + "'";
		selectQuery(q)
							.then(result => {
								var dis = {
									invoice_no: req.body.invoice,
									FG_code: req.body.product[i],
									quantity: req.body.quantity[i]
								}
								q = "INSERT INTO dispatch SET ?";
								insertQuery(q, dis)
													.then(result => {
														logger.info({
															where: `${ req.method } ${ req.url } ${ q }`,
															what: dis,
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
	}
	res.redirect("/finished_good/dispatch");
});

app.post("/finished_good/create",function(req,res){
	for(var i=0;i<req.body.finished_goods_code.length;i++){
		var q = "UPDATE finished_goods SET stock = stock + " + req.body.quantity[i] + " WHERE code ='" + req.body.finished_goods_code[i] + "'";
		selectQuery(q)
							.then(result => {
								var obj = {
									FG_code: req.body.finished_goods_code[i],
									quantity: req.body.quantity[i]
								};
								q = "INSERT INTO production SET ?";
								insertQuery(q, dis)
													.then(result => {
														logger.info({
															where: `${ req.method } ${ req.url } ${ q }`,
															what: dis,
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
							.then( _ => {
								q = "SELECT raw_material_code,quantity FROM finished_goods_detail WHERE code = '" + req.body.finished_goods_code[i] + "'";
								selectQuery(q)
													.then(raw_material => {
														for(var j=0;j<raw_material.length;j++){
															q = "UPDATE raw_material SET line_stock = line_stock - (" + req.body.quantity[i] + " * " + raw_material[j].quantity + ") WHERE code ='" + raw_material[j].raw_material_code + "'";
															selectQuery(q)
																				.then(result => {
																					logger.info({
																						where: `${ req.method } ${ req.url } ${ q }`,
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
														}
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
	res.redirect("/finished_good/create");
});

app.post("/finished_good/mock",function(req,res){
	var raw_quantity = {};
	const caclulateRequirement = async(i) => {
		var q = "SELECT * FROM finished_goods_detail WHERE code='" + req.body.finished_code[i] + "'";
		selectQuery(q)
							.then(raw_materials => {
								raw_materials.forEach(raw_material => {
									raw_quantity[raw_material.raw_material_code] += raw_material.quantity * req.body.quantity[i];
								});
								return new Promise((resolve,reject) => resolve());
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
	var q = "SELECT * FROM raw_material";
	selectQuery(q)
						.then(async(raw_material) => {
							for(var k=0;k<raw_material.length;k++){
								raw_quantity[raw_material[k].code] = 0;
							}
							for(var i=0;i<req.body.finished_code.length;i++){
								await caclulateRequirement(i);
							}
							q = "SELECT * FROM raw_material ORDER BY supplier_code ";
							selectQuery(q)
												.then(async(raw_materials) => {
													await raw_materials.forEach(raw => {
														raw.monthly_requirement = raw_quantity[raw.code];
													});
													let r = raw_materials.filter(raw => raw.monthly_requirement > 0 );
													res.render("BOM_manual",{raw_materials:r,w:0,mock:true,raw_quantity:raw_quantity});
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
});

app.post("/finished_good/search/category",function(req,res){
	var q = "SELECT * FROM finished_goods WHERE category ='" + req.body.category + "'";
	selectQuery(q)
						.then(finished_goods => {
							res.render("finished_good",{finished_goods:finished_goods});
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

app.post("/finished_good/new",function(req,res){
	var q = "INSERT INTO finished_goods SET ?";
	insertQuery(q, req.body.finished_good)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: req.body.finished_good,
								time: Date.now().toString()
							});
							q = "INSERT INTO finished_goods_detail SET ?";
							for(var i=0;i<req.body.quantity.length;i++){
								var raw_material = {
									code: req.body.finished_good.code,
									raw_material_code: req.body.product_code[i],
									quantity: req.body.quantity[i]
								}
								insertQuery(q, raw_material)
													.then(result => {
														logger.info({
															where: `${ req.method } ${ req.url } ${ q }`,
															what: raw_material,
															time: Date.now().toString()
														});
														res.redirect("/finished_good/" + req.params.code);
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
							res.redirect("/");
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

app.post("/finished_good/:code/new",function(req,res){
	var raw = {
		code: req.params.code,
		raw_material_code: req.body.newCode,
		quantity: req.body.newQuantity
	}
	var q ="INSERT INTO finished_goods_detail SET ?";
	insertQuery(q, raw)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: raw,
								time: Date.now().toString()
							});
							res.redirect("/finished_good/" + req.params.code);
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

app.put("/finished_good/:code",function(req,res){
	var q = "UPDATE finished_goods SET ? WHERE code ='" + req.params.code + "'";
	selectQuery(q)
						.then(finished_goods => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								time: Date.now().toString()
							});
							q = "DELETE FROM finished_goods_detail WHERE code='" + req.params.code + "'";
							selectQuery(q)
												.then(finished_goods => {
													logger.info({
														where: `${ req.method } ${ req.url } ${ q }`,
														time: Date.now().toString()
													});
													q = "DELETE FROM finished_goods_detail WHERE code='" + req.params.code + "'";
													for(var i=0;i<code.length;i++){
														q = "INSERT INTO finished_goods_detail SET ?";
														var raw = {
															code: req.body.finished_good.code,
															raw_material_code: req.body.code[i],
															quantity: req.body.quantity[i]
														}
														insertQuery(q, raw)
																			.then(result => {
																				logger.info({
																					where: `${ req.method } ${ req.url } ${ q }`,
																					what: raw,
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
													}
													res.redirect("/finished_good");
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
});

//=======================================================================================
//																		DELETE
//=======================================================================================

app.delete("/finished_good/:code",function(req,res){
	var q = "DELETE FROM finished_goods WHERE code='" + req.params.code + "'";
	selectQuery(q)
						.then(finished_goods => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								time: Date.now().toString()
							});
							q = "DELETE FROM finished_goods_detail WHERE code='" + req.params.code + "'";
							selectQuery(q)
												.then(finished_goods => {
													logger.info({
														where: `${ req.method } ${ req.url } ${ q }`,
														time: Date.now().toString()
													});
													res.redirect("/finished_good");
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
});

app.get("/finished_good/:code/:raw/delete",function(req,res){
	var q = "DELETE FROM finished_goods_detail WHERE code='" + req.params.code + "' AND raw_material_code='" + req.params.raw + "' LIMIT 1";
	selectQuery(q)
						.then(finished_goods => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								time: Date.now().toString()
							});
							res.redirect("/finished_good/" + req.params.code);
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

module.exports = app;
