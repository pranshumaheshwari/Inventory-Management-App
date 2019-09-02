var express 	   						 	 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js'),
		logger		  	 						 = require('../config/winston').finished_good,
		app      	   							 = express.Router();

//=======================================================================================
//																		GET
//=======================================================================================

app.get("/attendance", async (req, res) => {
	res.render("attendance")
})

app.post("/attendance", async (req, res) => {
	var q = `INSERT INTO attendance SET ?`
	insertQuery(q, {
		date: req.body.date,
		nos: req.body.nos 
	})
	.then(_ => {
		logger.info({
			where: `${ req.method } ${ req.url } ${ q }`,
			time: (new Date()).toISOString()
		});
		res.redirect("/attendance")
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

app.get("/BOM",async function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY category";
	await selectQuery(q)
						.then(finishedGoods => {
							res.render("BOM",{finishedGoods:finishedGoods,mock:false});
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err})
						});
});

app.get("/finished_good/bulkUpdate", async (req, res) => {
	var q = `SELECT * FROM finished_goods ORDER BY category`;
	selectQuery(q)
			.then(finishedGoods => {
				res.render("bulk_update", {data: finishedGoods, type: 'finished_good'});
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

app.post("/finished_good/bulkUpdate", async (req, res) => {
	var data = req.body.stock;
	for(const code in data) {
		let q = `SELECT stock FROM finished_goods WHERE code = '${code}'`
		let currentStock = await selectQuery(q)
									.then(f => f[0].stock)
									.catch(err => {
										logger.error({
												error: err,
												where: `${ req.method } ${ req.url } ${ q }`,
												time: (new Date()).toISOString()
										});
										res.render('error',{error: err})
										res.end()
									});
		let error = data[code] - currentStock;
		q = `INSERT INTO finished_goods_error SET ?`
		await insertQuery(q, {code, quantity: error})
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
		q = `UPDATE finished_goods SET stock = '${data[code]}' WHERE code = '${code}'`
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
	res.redirect("/finished_good")
});

app.get("/finished_good/production/delete", async (req, res) => {
	res.render("delete_production_dispatch", {type: "production"});
})

app.post("/finished_good/production/delete", async (req, res) => {
	var {from, to} = req.body;
	let q = `SELECT * FROM production WHERE date >= '${from}' AND date <= '${to}'`
	selectQuery(q)
			.then(finished_goods => {
				res.render("update_delete_production", {finished_goods})
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

app.get("/finished_good/dispatch/delete", async (req, res) => {
	res.render("delete_production_dispatch", {type: "dispatch"});
})

app.post("/finished_good/dispatch/delete", async (req, res) => {
	var {from, to} = req.body;
	let q = `SELECT * FROM dispatch WHERE date >= '${from}' AND date <= '${to}'`
	selectQuery(q)
			.then(finished_goods => {
				res.render("update_delete_dispatch", {finished_goods})
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

app.get("/finished_good",async function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY category";
	await selectQuery(q)
						.then(finished_goods => {
							res.render("finished_good",{finished_goods:finished_goods});
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

app.get("/finished_good/master",async (req,res) => {
	var q = "SELECT * FROM finished_goods ORDER BY category";
	let finished_goods = await selectQuery(q);
	res.render("finished_good-master",{finished_goods:finished_goods});
});

app.get("/finished_good/new",async function(req,res){
	var q = "SELECT * FROM raw_material ORDER BY name";
	await selectQuery(q)
						.then(raw_materials => {
							res.render("new_finished_good",{raw_materials:raw_materials});
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

app.get("/finished_good/mock",async function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY code";
	await selectQuery(q)
						.then(finished_goods => {
							res.render("BOM",{finishedGoods:finished_goods,mock:true});
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

app.get("/finished_good/reset",async function(req,res){
	var q = "UPDATE finished_goods SET quantity = 0";
	await selectQuery(q)
						.then(result => {
							res.redirect("/finished_good");
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

app.get("/finished_good/production",async function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY code";
	await selectQuery(q)
						.then(finished_goods => {
							res.render("input_finished_good",{finished_goods:finished_goods});
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

app.get("/finished_good/production/:date",async (req,res) => {
	let q = `SELECT * FROM production WHERE date BETWEEN '${ req.params.date }' AND '${ req.params.date }' + INTERVAL 1 DAY`;
	let finished_goods = await selectQuery(q)
									.catch(err => {
										logger.error({
												error: err,
												where: `${ req.method } ${ req.url } ${ q }`,
												time: (new Date()).toISOString()
										});
										res.render('error',{error: err})
										res.end()
									});
	res.render("update_delete_production",{finished_goods:finished_goods});
});

app.get("/finished_good/PD",async function(req,res){
	res.render("PD");
});

app.get("/finished_good/dispatch",async function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY code";
	await selectQuery(q)
						.then(finished_goods => {
							res.render("dispatch",{finished_goods:finished_goods});
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

app.get("/finished_good/dispatch/:invoice_no",async function(req,res){
	var q = `SELECT * FROM dispatch WHERE invoice_no = '${ req.params.invoice_no }'`;
	await selectQuery(q)
						.then(finished_goods => {
							finished_goods.length !== 0 ? res.render("update_delete_dispatch",{finished_goods:finished_goods}) : res.redirect("/finished_good/dispatch");
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

app.get("/finished_good/:code",async function(req,res){
	var q = "SELECT * FROM finished_goods WHERE code='" + req.params.code + "'";
	await selectQuery(q)
				.then(async finished_good => {
					q = "SELECT * FROM finished_goods_detail WHERE code='" + req.params.code + "' ORDER BY raw_material_code";
					await selectQuery(q)
							.then(async raw_materials => {
								q = "SELECT * FROM raw_material";
								await selectQuery(q)
										.then(raw => {
											q = `SELECT code FROM customer ORDER BY name`
											selectQuery(q)
												.then(customer => {
													res.render("update_delete_finished_good",{finished_good:finished_good[0],raw_materials,raw, customer});
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

app.get("/finished_good/BOM/:code",async function(req,res){
	var q = "SELECT name FROM finished_goods WHERE code ='" + req.params.code + "'";
	await selectQuery(q)
						.then(async name => {
							name = name[0].name;
							q = "SELECT f.*,r.name,r.stock FROM (SELECT * FROM finished_goods_detail WHERE code='" + req.params.code + "') AS f INNER JOIN raw_material AS r ON r.code = f.raw_material_code ORDER BY f.raw_material_code";
							await selectQuery(q)
												.then(raw_materials => {
													res.render("FG_BOM",{raw_materials:raw_materials,code:req.params.code,name:name});
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

app.get("/finished_good/:code/new",async function(req,res){
	var q = "SELECT * FROM raw_material";
	await selectQuery(q)
						.then(raw => {
							res.render("new_raw_finished_good",{raw:raw,code:req.params.code});
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

app.post("/BOM",async function(req,res){
	var raw_quantity = {};
	const caclulateRequirement = async(i) => {
		var q = "SELECT * FROM finished_goods_detail WHERE code='" + req.body.finished_code[i] + "'";
		await selectQuery(q)
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
										time: (new Date()).toISOString()
								});
								res.render('error',{error: err})
								res.end()
							});
	}
	var q = "SELECT * FROM raw_material";
	await selectQuery(q)
						.then(async raw_materials => {
							for(var k=0;k<raw_materials.length;k++){
								raw_quantity[raw_materials[k].code] = 0;
							}
							for(var i=0;i<req.body.finished_code.length;i++){
								if(req.body.quantity[i] === '' || req.body.quantity[i] === 0)
									continue;
								var q = "UPDATE finished_goods SET quantity ='" + req.body.quantity[i] + "' WHERE code ='" + req.body.finished_code[i] + "'";
								await selectQuery(q)
													.then(async(result) => {
															await caclulateRequirement(i);
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
							q = "SELECT * FROM raw_material ORDER BY supplier_code ";
							await selectQuery(q)
												.then(async(raw_materials) => {
													await raw_materials.forEach(async raw => {
														raw.monthly_requirement = raw_quantity[raw.code];
														q = `UPDATE raw_material SET monthly_requirement = ${ raw.monthly_requirement } WHERE code = '${ raw.code }'`;
														await selectQuery(q)
																					.then(result => {
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
																						res.render('error',{error: err});
																						res.end()
																					});
													});
													let r = raw_materials.filter(raw => raw.monthly_requirement > 0 );
													res.render("BOM_manual",{raw_materials:r,w:0,mock:false});
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

app.post("/finished_good/dispatch",async function(req,res){
	for(var i=0;i<req.body.product.length;i++){
		var q = "UPDATE finished_goods SET stock = stock - " + req.body.quantity[i] + " WHERE code ='" + req.body.product[i] + "'";
		await selectQuery(q)
							.then(async result => {
								logger.info({
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
								});
								var dis = {
									invoice_no: req.body.invoice,
									FG_code: req.body.product[i],
									quantity: req.body.quantity[i],
									date: req.body.date
								}
								q = "INSERT INTO dispatch SET ?";
								await insertQuery(q, dis)
													.then(result => {
														logger.info({
															where: `${ req.method } ${ req.url } ${ q }`,
															what: dis,
															time: (new Date()).toISOString()
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
	res.redirect("/finished_good/dispatch");
});

app.post("/finished_good/production",async function(req,res){
	for(var i=0;i<req.body.finished_goods_code.length;i++){
		var q = "UPDATE finished_goods SET stock = stock + " + req.body.quantity[i] + " WHERE code ='" + req.body.finished_goods_code[i] + "'";
		await selectQuery(q)
							.then(async result => {
								logger.info({
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
								});
								var obj = {
									FG_code: req.body.finished_goods_code[i],
									quantity: req.body.quantity[i],
									date: req.body.date
								};
								q = "INSERT INTO production SET ?";
								await insertQuery(q, obj)
													.then(result => {
														logger.info({
															where: `${ req.method } ${ req.url } ${ q }`,
															what: obj,
															time: (new Date()).toISOString()
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
							})
							.then(async _ => {
								q = "SELECT raw_material_code,quantity FROM finished_goods_detail WHERE code = '" + req.body.finished_goods_code[i] + "'";
								await selectQuery(q)
													.then(async raw_material => {
														for(var j=0;j<raw_material.length;j++){
															q = "UPDATE raw_material SET line_stock = line_stock - (" + req.body.quantity[i] + " * " + raw_material[j].quantity + ") WHERE code ='" + raw_material[j].raw_material_code + "'";
															await selectQuery(q)
																				.then(result => {
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
	res.redirect("/finished_good/production");
});

app.post("/finished_good/mock",async function(req,res){
	var raw_quantity = {};
	const caclulateRequirement = async(i) => {
		var q = "SELECT * FROM finished_goods_detail WHERE code='" + req.body.finished_code[i] + "'";
		await selectQuery(q)
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
										time: (new Date()).toISOString()
								});
								res.render('error',{error: err})
								res.end()
							});
	}
	var q = "SELECT * FROM raw_material";
	await selectQuery(q)
						.then(async raw_material => {
							for(var k=0;k<raw_material.length;k++){
								raw_quantity[raw_material[k].code] = 0;
							}
							for(var i=0;i<req.body.finished_code.length;i++){
								await caclulateRequirement(i);
							}
							q = "SELECT * FROM raw_material ORDER BY supplier_code ";
							await selectQuery(q)
												.then(async(raw_materials) => {
													await raw_materials.forEach(raw => {
														raw.monthly_requirement = raw_quantity[raw.code];
													});
													let r = raw_materials.filter(raw => raw.monthly_requirement >= 0 );
													res.render("BOM_manual",{raw_materials:r,w:0,mock:true,raw_quantity:raw_quantity});
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

app.post("/finished_good/search/category",async function(req,res){
	var q = "SELECT * FROM finished_goods WHERE category ='" + req.body.category + "'";
	await selectQuery(q)
						.then(finished_goods => {
							res.render("finished_good",{finished_goods:finished_goods});
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

app.post("/finished_good/new",async function(req,res){
	var q = "INSERT INTO finished_goods SET ?";
	await insertQuery(q, req.body.finished_good)
						.then(async result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: req.body.finished_good,
								time: (new Date()).toISOString()
							});
							q = "INSERT INTO finished_goods_detail SET ?";
							for(var i=0;i<req.body.quantity.length;i++){
								var raw_material = {
									code: req.body.finished_good.code,
									raw_material_code: req.body.product_code[i],
									quantity: req.body.quantity[i]
								}
								await insertQuery(q, raw_material)
													.then(result => {
														logger.info({
															where: `${ req.method } ${ req.url } ${ q }`,
															what: raw_material,
															time: (new Date()).toISOString()
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
							}
							res.redirect("/finished_good/" + req.body.finished_good.code);
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

app.post("/finished_good/:code/new",async function(req,res){
	var raw = {
		code: req.params.code,
		raw_material_code: req.body.newCode,
		quantity: req.body.newQuantity
	}
	var q ="INSERT INTO finished_goods_detail SET ?";
	await insertQuery(q, raw)
						.then(result => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								what: raw,
								time: (new Date()).toISOString()
							});
							res.redirect("/finished_good");
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
//										PUT
//=======================================================================================

app.put("/finished_good/:code",async function(req,res){
	var q = "UPDATE finished_goods SET ? WHERE code ='" + req.params.code + "'";
	await insertQuery(q,req.body.finished_good)
						.then(async _ => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								time: (new Date()).toISOString()
							});
							q = "DELETE FROM finished_goods_detail WHERE code='" + req.body.finished_good.code + "'";
							await selectQuery(q)
												.then(async _ => {
													logger.info({
														where: `${ req.method } ${ req.url } ${ q }`,
														time: (new Date()).toISOString()
													});
													q = "DELETE FROM finished_goods_detail WHERE code='" + req.body.finished_good.code + "'";
													for(var i=0;i<req.body.code.length;i++){
														q = "INSERT INTO finished_goods_detail SET ?";
														var raw = {
															code: req.body.finished_good.code,
															raw_material_code: req.body.code[i],
															quantity: req.body.quantity[i]
														}
														await insertQuery(q, raw)
																			.then(result => {
																				logger.info({
																					where: `${ req.method } ${ req.url } ${ q }`,
																					what: raw,
																					time: (new Date()).toISOString()
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
													}
													res.redirect("/finished_good");
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
//										DELETE
//=======================================================================================

app.delete("/finished_good/production/:code/:date/:quantity",async (req,res) => {
	let q = `UPDATE finished_goods SET stock = stock - ${ req.params.quantity } WHERE code = '${ req.params.code }'`;
	await selectQuery(q)
			.then(result => {
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
	q = `SELECT * FROM finished_goods_detail WHERE code = '${ req.params.code }'`;
	let raw_materials = await selectQuery(q)
								.catch(err => {
									logger.error({
											error: err,
											where: `${ req.method } ${ req.url } ${ q }`,
											time: (new Date()).toISOString()
									});
									res.render('error',{error: err})
									res.end()
								});
	await raw_materials.forEach(async raw_material => {
		q = `UPDATE raw_material SET line_stock = line_stock + (${ req.params.quantity } * ${ raw_material.quantity }) WHERE code = '${ raw_material.raw_material_code }'`;
		await selectQuery(q)
					.then(result => {
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
	});
	q = `DELETE FROM production WHERE FG_code = '${ req.params.code }' AND date BETWEEN '${ req.params.date }' AND '${ req.params.date }' + INTERVAL 1 DAY AND quantity = ${ req.params.quantity }`;
	await selectQuery(q)
				.then(result => {
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
	res.redirect("/finished_good/production");
});

app.delete("/finished_good/production/:id", async (req, res) => {
	let q = `SELECT * FROM production WHERE id = '${req.params.id}'`
	let production = await selectQuery(q)
								.then(data => data[0])
								.catch(err => {
									logger.error({
											error: err,
											where: `${ req.method } ${ req.url } ${ q }`,
											time: (new Date()).toISOString()
									});
									res.render('error',{error: err})
									res.end()
								});
	q = `UPDATE finished_goods SET stock = stock - ${ production.quantity } WHERE code = '${ production.FG_code }'`;
	await selectQuery(q)
			.then(result => {
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
	q = `SELECT * FROM finished_goods_detail WHERE code = '${ production.FG_code }'`;
	let raw_materials = await selectQuery(q)
								.catch(err => {
									logger.error({
											error: err,
											where: `${ req.method } ${ req.url } ${ q }`,
											time: (new Date()).toISOString()
									});
									res.render('error',{error: err})
									res.end()
								});
	for(let r of raw_materials) {
		q = `UPDATE raw_material SET line_stock = line_stock + (${ production.quantity } * ${ r.quantity }) WHERE code = '${ r.raw_material_code }'`;
		await selectQuery(q)
					.then(result => {
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
	};
	q = `DELETE FROM production WHERE id = '${req.params.id}'`
	await selectQuery(q)
				.then(result => {
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
	res.json({
		ok: true
	});
});

app.delete("/finished_good/dispatch/:invoice_no/:code",async (req,res) => {
	let q = `SELECT * FROM dispatch WHERE invoice_no = '${ req.params.invoice_no }' AND FG_code = '${ req.params.code }'`;
	let finished_good = await selectQuery(q)
									.catch(err => {
										logger.error({
												error: err,
												where: `${ req.method } ${ req.url } ${ q }`,
												time: (new Date()).toISOString()
										});
										res.render('error',{error: err})
										res.end()
									});
	q = `UPDATE finished_goods SET stock = stock + ${ finished_good.quantity } WHERE code = '${ req.params.code }'`;
	await selectQuery(q)
								.then(result => {
									logger.info({
											where: `${ req.method } ${ req.url } ${ q }`,
											time: (new Date()).toISOString()
									});
									res.redirect(`/finished_good/dispatch/${req.params.invoice_no}`);
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

app.delete("/finished_good/dispatch/:id", async (req, res) => {
	let q = `SELECT * FROM dispatch WHERE id = '${ req.params.id }'`;
	let finished_good = await selectQuery(q)
									.then(data => data[0])
									.catch(err => {
										logger.error({
												error: err,
												where: `${ req.method } ${ req.url } ${ q }`,
												time: (new Date()).toISOString()
										});
										res.render('error',{error: err})
										res.end()
									});
	q = `UPDATE finished_goods SET stock = stock + ${ finished_good.quantity } WHERE code = '${ finished_good.FG_code }'`;
	await selectQuery(q)
					.then(result => {
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
	q = `DELETE FROM dispatch WHERE id = '${req.params.id}'`
	await selectQuery(q)
					.then(result => {
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
	res.json({
		ok: true
	});
});

app.delete("/finished_good/dispatch/:invoice_no",async (req,res) => {
	let q = `SELECT * FROM dispatch WHERE invoice_no = '${ req.params.invoice_no }'`;
	let finished_goods = await selectQuery(q)
																		.catch(err => {
																			logger.error({
																					error: err,
																					where: `${ req.method } ${ req.url } ${ q }`,
																					time: (new Date()).toISOString()
																			});
																			res.render('error',{error: err})
																			res.end()
																		});
	await finished_goods.forEach(async finished_good => {
		q = `UPDATE finished_goods SET stock = stock + ${ finished_good.quantity } WHERE code = '${ finished_good.FG_code }'`;
		await selectQuery(q)
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
	res.redirect(`/finished_good/dispatch`);
});

app.delete("/finished_good/:code",async function(req,res){
	var q = "DELETE FROM finished_goods WHERE code='" + req.params.code + "'";
	await selectQuery(q)
						.then(async finished_goods => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								time: (new Date()).toISOString()
							});
							q = "DELETE FROM finished_goods_detail WHERE code='" + req.params.code + "'";
							await selectQuery(q)
												.then(finished_goods => {
													logger.info({
														where: `${ req.method } ${ req.url } ${ q }`,
														time: (new Date()).toISOString()
													});
													res.redirect("/finished_good");
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

app.get("/finished_good/:code/:raw/delete",async function(req,res){
	var q = "DELETE FROM finished_goods_detail WHERE code='" + req.params.code + "' AND raw_material_code='" + req.params.raw + "' LIMIT 1";
	await selectQuery(q)
						.then(finished_goods => {
							logger.info({
								where: `${ req.method } ${ req.url } ${ q }`,
								time: (new Date()).toISOString()
							});
							res.redirect("/finished_good/" + req.params.code);
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

module.exports = app;
