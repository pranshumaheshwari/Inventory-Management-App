var express 	   						 	 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js'),
		logger		  	 						 = require('../config/winston').report,
		app      	   							 = express.Router();

//=======================================================================================
//																		GET
//=======================================================================================

app.get("/report",function(req,res){
	res.render("reports");
});

app.get("/report/finishedGoodsError", async (req, res) => {
	res.render("date", {action: "finishedGoodsError"});	
});

app.get("/report/rawMaterialError", async (req, res) => {
	res.render("date", {action: "rawMaterialError"});	
});

app.post("/report/finishedGoodsError", async (req, res) => {
	var {to, from} = req.body;
	var q = `SELECT * FROM finished_goods_error WHERE date >= '${from}' AND date <= '${to}'`
	selectQuery(q)
			.then(data => {
				res.render("report_error", {data, to, from, type: 'finished_goods'})
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

app.post("/report/rawMaterialError", async (req, res) => {
	var {to, from} = req.body;
	var q = `SELECT * FROM raw_material_error WHERE date >= '${from}' AND date <= '${to}'`
	selectQuery(q)
			.then(data => {
				res.render("report_error", {data, to, from, type: 'raw_material'})
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
//																		FINISHED GOODS
//=======================================================================================

//																		BY DESCRIPTION

	app.get("/report/FG_Name",async function(req,res){
		var q = "SELECT name,code FROM finished_goods ORDER BY code";
		await selectQuery(q)
							.then(finished_goods => {
								res.render("report_P-D",{type:"FG_Name",finished_goods:finished_goods});
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

	app.post("/report/FG_Name",async function(req,res){
		var from = req.body.from;
		var to = req.body.to;
		var finished_good_code = req.body.name;
		var currentStock,totalExchange,closingStock,openingStock,finished_good,finished_goods;
		var q = "SELECT * FROM finished_goods WHERE code ='" + finished_good_code + "'";
		await selectQuery(q)
							.then(Finished_good => {
								finished_good = Finished_good[0];
								currentStock = finished_good.stock;
							})
							.then(async _ => {
								q = "SELECT SUM(quantity) AS sum FROM production WHERE date >='" + from + "' AND date <='" + to + "' AND FG_code ='" + finished_good_code + "' ";
								await selectQuery(q)
													.then(sum => {
														totalExchange = sum[0].sum;
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
							.then(async _ => {
								q = "SELECT SUM(quantity) AS sum FROM dispatch WHERE date >='" + from + "' AND date <='" + to + "' AND FG_code ='" + finished_good_code + "' ";
								await selectQuery(q)
													.then(sum => {
														totalExchange -= sum[0].sum;
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
							.then(async _ => {
								q = "SELECT SUM(quantity) AS sum FROM production WHERE date >'" + to + "' AND FG_code ='" + finished_good_code + "' ";
								await selectQuery(q)
													.then(sum => {
														if(!sum[0].sum)
															sum[0].sum = 0;
														closingStock = currentStock - sum[0].sum;
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
							.then(async _ => {
								q = "SELECT SUM(quantity) AS sum FROM dispatch WHERE date >'" + to + "' AND FG_code ='" + finished_good_code + "'";
								await selectQuery(q)
													.then(sum => {
														if(!sum[0].sum)
															sum[0].sum = 0;
														closingStock += sum[0].sum;
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
							.then(async _ => {
								openingStock = closingStock - totalExchange;
								q = "SELECT * ,'p' AS type FROM production WHERE FG_code ='" + finished_good_code + "' AND date >='" + from + "' AND date <='" + to + "' ORDER by date ";
								await selectQuery(q)
													.then(fg => {
														finished_goods = fg;
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
							.then(async _ => {
								q = "SELECT * FROM dispatch WHERE FG_code ='" + finished_good_code + "' AND date >='" + from + "' AND date <='" + to + "' ORDER by date"
								await selectQuery(q)
													.then(fg => {
														finished_goods.push(...fg);
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
							.then(async _ => {
								await finished_goods.sort(function(a,b){
									var dateA = new Date(a.date);
									var dateB = new Date(b.date);
				    				return dateA-dateB;
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
		res.render("report_pd",{finished_goods:finished_goods,openingStock:openingStock,closingStock:closingStock,to:to,from:from,finished_good:finished_good,t:'FGName',totalExchange:totalExchange,productionQuantity:0,dispatchQuantity:0});
	});

//																		BY DATE

	app.get("/report/date",function(req,res){
		res.render("report_FG-date");
	});

	app.post("/report/date",async function(req,res){
		var q = "SELECT * FROM " + req.body.type + " WHERE date >= '" + req.body.from + "' AND date <= '" + req.body.to + "' ORDER BY date";
		await selectQuery(q)
							.then(finished_goods => {
								res.render("report_FG-date_data",{finished_goods:finished_goods,type:req.body.type,from:req.body.from,to:req.body.to});
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


//																		PRODUCTION

	app.get("/report/production",async function (req,res) {
		var q = "SELECT name,code FROM finished_goods ORDER BY code";
		await selectQuery(q)
							.then(finished_goods => {
								res.render("report_P-D",{type:"production",finished_goods:finished_goods});
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

	app.post("/report/production",async function(req,res){
		var from = req.body.from;
		var to = req.body.to;
		var finished_good_code = req.body.name;
		var totalExchange,finished_good;
		var q = "SELECT * FROM finished_goods WHERE code ='" + finished_good_code + "'";
		await selectQuery(q)
							.then(Finished_good => {
								Finished_good = Finished_good[0];
								currentStock = Finished_good.stock;
								finished_good = Finished_good;
							})
							.then(async _ => {
								q = "SELECT SUM(quantity) AS sum FROM production WHERE date >='" + from + "' AND date <='" + to + "' AND FG_code ='" + finished_good_code + "'";
								await selectQuery(q)
													.then(sum => {
														sum = sum[0];
														if(sum.sum)
															totalExchange = sum.sum;
														else
															totalExchange = 0;
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
							.then(async _ => {
								q = "SELECT * FROM production WHERE FG_code ='" + finished_good_code + "' AND date >='" + from + "' AND date <='" + to + "' ORDER by date";
								await selectQuery(q)
													.then(finished_goods => {
														res.render("report_pd",{t:'production',finished_goods:finished_goods,openingStock:0,closingStock:0,to:to,from:from,finished_good:finished_good,totalExchange:totalExchange,productionQuantity:0,dispatchQuantity:0});
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


//																		DISPATCH

	app.get("/report/dispatch",async function(req,res){
		var q = "SELECT name,code FROM finished_goods ORDER BY code";
		await selectQuery(q)
							.then(finished_goods => {
								res.render("report_P-D",{type:"dispatch",finished_goods:finished_goods});
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

	app.post("/report/dispatch",async function(req,res){
		var from = req.body.from;
		var to = req.body.to;
		var finished_good_code = req.body.name;
		var totalExchange,finished_good;
		var q = "SELECT * FROM finished_goods WHERE code ='" + finished_good_code + "'";
		await selectQuery(q)
							.then(Finished_good => {
								Finished_good = Finished_good[0];
								currentStock = Finished_good.stock;
								finished_good = Finished_good;
							})
							.then(async _ => {
								q = "SELECT SUM(quantity) AS sum FROM dispatch WHERE date >='" + from + "' AND date <='" + to + "' AND FG_code ='" + finished_good_code + "'";
								await selectQuery(q)
													.then(sum => {
														sum = sum[0];
														if(sum.sum)
															totalExchange = sum.sum;
														else
															totalExchange = 0;
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
							.then(async _ => {
								q = "SELECT * FROM dispatch WHERE FG_code ='" + finished_good_code + "' AND date >='" + from + "' AND date <='" + to + "' ORDER by date";
								await selectQuery(q)
													.then(finished_goods => {
														res.render("report_pd",{t:'dispatch',finished_goods:finished_goods,openingStock:0,closingStock:0,to:to,from:from,finished_good:finished_good,totalExchange:totalExchange,productionQuantity:0,dispatchQuantity:0});
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
//																		RAW MATERIAL
//=======================================================================================

//																		BY DESCRIPTION

app.get("/report/name",async function(req,res){
	var q = "SELECT * FROM raw_material ORDER BY code";
	await selectQuery(q)
			.then(raw_materials => {
				res.render("report_by_name",{raw_materials:raw_materials});
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

app.post("/report/name",async function(req,res){
	var raw = req.body.raw_material.split("$");

	let {to, from} = req.body
	let q = `
			SELECT PO_code, invoice_no, quantity, date, 'i' type FROM input WHERE DTPL_code = "${raw[1]}" AND raw_desc = "${raw[2]}" AND date >= "${from}" AND date <= "${to}" 
			UNION 
			SELECT req_id, RM_code, quantity, date, 'ro' type FROM requisition_output WHERE RM_code = "${raw[0]}" AND date >= "${from}" AND date <= "${to}" 
			UNION 
			SELECT slip_no, raw_material_code, quantity, date, 'o' type FROM output WHERE raw_material_code = "${raw[0]}" AND date >= "${from}" AND date <= "${to}" 
			ORDER BY date
		`
	let data = await selectQuery(q)
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err})
							res.end()
							});
	q = `SELECT stock FROM raw_material WHERE code = "${raw[0]}"`
	let currentStock = await selectQuery(q).then(d => d[0].stock)
								.catch(err => {
									logger.error({
											error: err,
											where: `${ req.method } ${ req.url } ${ q }`,
											time: (new Date()).toISOString()
									});
									res.render('error',{error: err})
									res.end()
									});
	q = `SELECT SUM(quantity) quantity FROM input WHERE DTPL_code = "${raw[1]}" AND raw_desc = "${raw[2]}" AND date >= "${from}" AND date <= "${to}"`
	let totalInputInRange = await selectQuery(q).then(d => d[0].quantity)
										.catch(err => {
											logger.error({
													error: err,
													where: `${ req.method } ${ req.url } ${ q }`,
													time: (new Date()).toISOString()
											});
											res.render('error',{error: err})
											res.end()
											});
	q = `SELECT SUM(quantity) quantity FROM requisition_output WHERE RM_code = "${raw[0]}" AND date >= "${from}" AND date <= "${to}"`
	let totalOutputInRange = await selectQuery(q).then(d => d[0].quantity)
										.catch(err => {
											logger.error({
													error: err,
													where: `${ req.method } ${ req.url } ${ q }`,
													time: (new Date()).toISOString()
											});
											res.render('error',{error: err})
											res.end()
											});
	q = `SELECT SUM(quantity) quantity FROM output WHERE raw_material_code = "${raw[0]}" AND date >= "${from}" AND date <= "${to}"`
	totalOutputInRange += await selectQuery(q).then(d => d[0].quantity)
										.catch(err => {
											logger.error({
													error: err,
													where: `${ req.method } ${ req.url } ${ q }`,
													time: (new Date()).toISOString()
											});
											res.render('error',{error: err})
											res.end()
											});
	q = `SELECT SUM(quantity) quantity FROM input WHERE DTPL_code = "${raw[1]}" AND raw_desc = "${raw[2]}" AND date > "${to}"`
	let totalInputOutRange = await selectQuery(q).then(d => d[0].quantity)
										.catch(err => {
											logger.error({
													error: err,
													where: `${ req.method } ${ req.url } ${ q }`,
													time: (new Date()).toISOString()
											});
											res.render('error',{error: err})
											res.end()
											});
	q = `SELECT SUM(quantity) quantity FROM requisition_output WHERE RM_code = "${raw[0]}" AND date > "${to}"`
	let totalOutputOutRange = await selectQuery(q).then(d => d[0].quantity)
										.catch(err => {
											logger.error({
													error: err,
													where: `${ req.method } ${ req.url } ${ q }`,
													time: (new Date()).toISOString()
											});
											res.render('error',{error: err})
											res.end()
											});
	q = `SELECT SUM(quantity) quantity FROM output WHERE raw_material_code = "${raw[0]}" AND date > "${to}"`
	totalOutputOutRange += await selectQuery(q).then(d => d[0].quantity)
										.catch(err => {
											logger.error({
													error: err,
													where: `${ req.method } ${ req.url } ${ q }`,
													time: (new Date()).toISOString()
											});
											res.render('error',{error: err})
											res.end()
											});
	let openingStock = currentStock + totalOutputInRange + totalOutputOutRange - totalInputInRange - totalInputOutRange
	res.render("reports_with_data",{input_output:data, currentStock, openingStock, from, to, totalInputInRange, totalOutputInRange, raw});
	// var Dateto = req.body.to.split("-"), Datefrom = req.body.from.split("-");
	// var to = new Date(Dateto[0],parseInt(Dateto[1])-1,Dateto[2]);
	// var from = new Date(Datefrom[0],parseInt(Datefrom[1])-1,Datefrom[2]);
	// var input_output = [], openingStock, closingStock, raw_material, inputs, outputs;
	// var currentStock;
	// var q = "SELECT * FROM raw_material WHERE code = '" + raw[0] + "'";
	// await selectQuery(q)
	// 		.then(async raw_materials => {
	// 			raw_material = raw_materials[0];
	// 			currentStock = raw_material.stock;
	// 			q = "SELECT * FROM input WHERE DTPL_code ='" + raw[1] + "' AND raw_desc='" + raw[2] + "' ORDER BY date";
	// 			inputs = await selectQuery(q)
	// 								.catch(err => {
	// 									logger.error({
	// 											error: err,
	// 											where: `${ req.method } ${ req.url } ${ q }`,
	// 											time: (new Date()).toISOString()
	// 									});
	// 									res.render('error',{error: err})
	// 									res.end()
	// 								});
	// 		})
	// 		.then(async _ => {
	// 			q = "SELECT * FROM output WHERE raw_material_code ='" + raw_material.code + "' ORDER BY date";
	// 			outputs = await selectQuery(q)
	// 								.catch(err => {
	// 									logger.error({
	// 											error: err,
	// 											where: `${ req.method } ${ req.url } ${ q }`,
	// 											time: (new Date()).toISOString()
	// 									});
	// 									res.render('error',{error: err})
	// 									res.end()
	// 								});
	// 		})
	// 		.then(async _ => {
	// 			closingStock = currentStock;
	// 			for(var i=0;i<inputs.length;i++){
	// 				if(inputs[i].date > new Date(to.getTime() + (24*60*60*1000))){
	// 					closingStock -= inputs[i].quantity;
	// 				}
	// 			}
	// 			for(var i=0;i<outputs.length;i++){
	// 				if(outputs[i].date > new Date(to.getTime() + (24*60*60*1000))){
	// 					closingStock += outputs[i].quantity;
	// 				}
	// 			}
	// 			var check = from;
	// 			openingStock = closingStock;
	// 			for(var j=0;check >= from && check <= to;j++){
	// 				for(var i=0;i<inputs.length;i++){
	// 					if(inputs[i].date.getDate() === check.getDate() && inputs[i].date.getMonth() === check.getMonth() && inputs[i].date.getFullYear() === check.getFullYear()){
	// 						input_output.push(inputs[i]);
	// 						openingStock -= inputs[i].quantity;
	// 					}
	// 				}
	// 				for(var i=0;i<outputs.length;i++){
	// 					if(outputs[i].date.getDate() === check.getDate() && outputs[i].date.getMonth() === check.getMonth() && outputs[i].date.getFullYear() === check.getFullYear()){
	// 						input_output.push(outputs[i]);
	// 						openingStock += outputs[i].quantity;
	// 					}
	// 				}
	// 				check = new Date(check.getTime() + (24*60*60*1000));
	// 			}
	// 		})
	// 		.then( _ => {
	// 			res.render("reports_with_data",{input_output:input_output,raw_material:raw_material,openingStock:openingStock,closingStock:closingStock,from:req.body.from,to:req.body.to,total_in:0,total_out:0});
	// 		})
	// 		.catch(err => {
	// 			logger.error({
	// 					error: err,
	// 					where: `${ req.method } ${ req.url } ${ q }`,
	// 					time: (new Date()).toISOString()
	// 			});
	// 			res.render('error',{error: err})
	// 			res.end()
	// 		});
});

//																		BY PO

app.get("/report/PO",async function(req,res){
	var q = "SELECT * FROM PO";
	await selectQuery(q)
						.then(PO => {
							res.render("report_by_PO",{PO:PO});
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

app.get("/report/PO/:code",async function(req,res){
	var q = "SELECT * FROM input WHERE PO_code ='" + req.params.code + "'";
	await selectQuery(q)
						.then(inputs => {
							res.render("report_by_PO_detail",{PO_code:req.params.code,inputs:inputs});
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

app.post("/report/PO",async function(req,res){
		var q = 'SELECT p.*,i.sum FROM PO_detail AS p LEFT OUTER JOIN (SELECT SUM(quantity) AS sum,PO_code,raw_desc FROM input WHERE PO_code = "' + req.body.PO.code + '" GROUP BY raw_desc) AS i ON p.PO_code = i.PO_code AND p.raw_desc = i.raw_desc WHERE p.PO_code = "' + req.body.PO.code + '"';
		await selectQuery(q)
							.then(PO => {
								res.render("report_with_data",{POs:PO});
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

//																		SHORTAGE

app.get("/report/shortage",async function(req,res){
	var q = "SELECT * FROM raw_material WHERE stock<0.25*monthly_requirement ORDER BY code";
	await selectQuery(q)
						.then(raw => {
							res.render("report_more_less",{raw_materials:raw,type:"shortage"});
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

//																		EXCESS

app.get("/report/excess",async function(req,res){
	var q = "SELECT * FROM raw_material WHERE stock>monthly_requirement ORDER BY code";
	await selectQuery(q)
						.then(raw => {
							res.render("report_more_less",{raw_materials:raw,type:"excess"});
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

// 																		Schedule Tracker

app.get("/report/ScheduleTracker", async (req, res) => {
		var d = new Date();
		var month = d.getMonth() + 1;
		var date = d.getDate();
		var q = "SELECT code, category, quantity FROM finished_goods ORDER BY category";
		var finished_goods = await selectQuery(q)
										.catch(err => {
											logger.error({
												error: err,
												where: `${ req.method } ${ req.url } ${ q }`,
												time: (new Date()).toISOString()
											});
											res.render('error',{error: err})
											res.end()
										});
							for(var i = 0;i<finished_goods.length;i++){
								q = `SELECT DATE(date) AS date, SUM(quantity) AS quantity FROM dispatch WHERE FG_code = '${ finished_goods[i].code }' AND MONTH(date) = '${ month }' GROUP BY DATE(date)`;
								finished_goods[i].dispatch = await selectQuery(q)
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
	res.render("ScheduleTracker", { finished_goods, date, month });
});

// 																		Production Tracker

app.get("/report/ProductionTracker", async (req, res) => {
	var d = new Date();
	var month = d.getMonth() + 1;
	var date = d.getDate();
	var q = "SELECT code, category, quantity FROM finished_goods ORDER BY category";
	var finished_goods = await selectQuery(q)
							.catch(err => {
								logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
										time: (new Date()).toISOString()
									});
									res.render('error',{error: err})
									res.end()
								});
							for(var i = 0;i<finished_goods.length;i++){
								q = `SELECT DATE(date) AS date, SUM(quantity) AS quantity FROM production WHERE FG_code = '${ finished_goods[i].code }' AND MONTH(date) = '${ month }' GROUP BY DATE(date)`;
								finished_goods[i].production = await selectQuery(q)
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
	res.render("ProductionTracker", { finished_goods, date, month });
});

//										Man Power Efficenicy

app.get("/report/manPower", async (req, res) => {
	res.render("date", {action: "manPower"});
});

app.post("/report/manPower", async (req, res) => {
	let from = req.body.from;
	let to = req.body.to;
	// var q = `
	// 		SELECT SUM(p.quantity) AS quantity, p.FG_code, 
	// 			   fg.man_power, fg.name, fg.overheads, fg.category
	// 		FROM production p
	// 		INNER JOIN finished_goods fg 
	// 		ON p.FG_code = fg.code 
	// 		WHERE p.date >= '${from}' AND p.date <= '${to}'
	// 		GROUP BY p.FG_code 
	// 		ORDER BY fg.category
	// 		`
	// selectQuery(q)
	// 	.then(data => {
	// 		q = `SELECT SUM(nos) AS nos FROM attendance WHERE date >= '${from}' AND date <= '${to}'`
	// 		selectQuery(q)
	// 			.then(nos => {
	// 				res.render('report_man_power', { data, nos: nos[0].nos, from, to });
	// 			})
	// 			.catch(err => {
	// 				logger.error({
	// 					error: err,
	// 					where: `${ req.method } ${ req.url } ${ q }`,
	// 						time: (new Date()).toISOString()
	// 					});
	// 				res.render('error',{error: err})
	// 				res.end()
	// 			});
	// 	})
		// .catch(err => {
		// 	logger.error({
		// 		error: err,
		// 		where: `${ req.method } ${ req.url } ${ q }`,
		// 			time: (new Date()).toISOString()
		// 		});
		// 	res.render('error',{error: err})
		// 	res.end()
		// });

	let data = await selectQuery(`SELECT code, name, category, man_power, overheads FROM finished_goods ORDER BY code`)
	// let q = `
	// 			SELECT fg.code, fg.name, fg.category, fg.man_power, fg.overheads 
	// 			FROM production p 
	// 			INNER JOIN finished_goods fg ON fg.code = p.FG_code 
	// 			WHERE p.date >= "${from}" AND p.date <= "${to}" 
	// 			HAVING SUM(p.quantity) > 0
	// 			ORDER BY fg.code
	// 		`
	// let data = await selectQuery(q)
	let dateFrom = new Date(from), dateTo = new Date(to)
	let date = dateFrom
	let attendance = []
	let numberOfDays = ((dateTo.getTime() - dateFrom.getTime()) / (1000 * 3600 * 24)) + 1
	for(let i=0;i<numberOfDays;i++) {
		for(let r of data) {
			if(!r.productionData) r.productionData = []
			let q = `
					SELECT SUM(p.quantity) quantity, "${date}" date
					FROM production p
					WHERE DAY(p.date) = '${date.getDate()}' AND MONTH(p.date) = '${date.getMonth()+1}' AND YEAR(p.date) = '${date.getFullYear()}' AND p.FG_code = "${r.code}"
					`
			r.productionData.push(
				await selectQuery(q)
				.then(data => data[0])
				.catch(err => {
					logger.error({
						error: err,
						where: `${ req.method } ${ req.url } ${ q }`,
							time: (new Date()).toISOString()
						});
					res.render('error',{error: err})
					res.end()
				}))
		}
		q = `SELECT SUM(nos) nos FROM attendance WHERE DAY(date) = '${date.getDate()}' AND MONTH(date) = '${date.getMonth()+1}' AND YEAR(date) = '${date.getFullYear()}'`
		attendance.push(
			await selectQuery(q)
			.then(data => data[0])
			.then(data => (!data) ? {nos: 0} : data)
			.then(data => data.nos)
			.catch(err => {
				logger.error({
					error: err,
					where: `${ req.method } ${ req.url } ${ q }`,
						time: (new Date()).toISOString()
					});
				res.render('error',{error: err})
				res.end()
			}))
		date.setDate(date.getDate() + 1)
	}
	res.render("report_man_power", {data, attendance, from, to})
});

app.get('/report/attendance', async (req, res) => {
	res.render("date", {action: "attendance"});	
});

app.post('/report/attendance', async (req, res) => {
	var from = req.body.from;
	var to = req.body.to;
	var q = `SELECT * FROM attendance WHERE date >= '${from}' AND date < '${to}'`
	selectQuery(q)
			.then(data => {
				res.render("report_attendance", {data})
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

//																		INPUT-OUTPUT

app.get("/report/input",function(req,res){
	res.render("report_date",{type:"input"});
});

app.get("/report/output",function(req,res){
	res.render("report_date",{type:"output"});
});

app.get("/report/requisition",function(req,res){
	res.render("report_date",{type:"requisition"});
});

app.post("/report/:type",async function(req,res){
	var to = req.body.to, from = req.body.from;
	var q;
	if(req.params.type === "input")
		q = `SELECT i.*, r.code FROM input AS i INNER JOIN raw_material AS r ON r.name = i.raw_desc WHERE date >= "${from}" AND date <= "${to}" ORDER BY date`
	else if (req.params.type === "output")
		q = `SELECT * FROM output WHERE date >= "${from}" AND date <= "${to}" ORDER BY date`
	else if (req.params.type === "requisition")
		q = `SELECT * FROM requisition_output WHERE date >= "${from}" AND date <= "${to}" AND req_id != 0 ORDER BY date`
	await selectQuery(q)
			.then(data => {
				res.render("report_inputORoutput",{i_o:data,type:req.params.type,to:to,from:from});
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

app.post("/report",function(req,res){
	var by = req.body.by;
	if(by === "Name")
		res.redirect("/report/name");
	else if(by === "PO")
		res.redirect("/report/PO");
	else if (by === "input")
		res.redirect("/report/input");
	else if (by === "output")
		res.redirect("/report/output");
	else if (by === 'less')
		res.redirect("/report/shortage");
	else if (by === 'more')
		res.redirect("/report/excess");
	else if (by === 'Production')
		res.redirect("/report/production");
	else if (by === 'Dispatch')
		res.redirect("/report/dispatch");
	else if(by === 'Date')
		res.redirect("/report/date");
	else if(by === 'FGName')
		res.redirect("/report/FG_Name");
	else if(by === 'ScheduleTracker')
		res.redirect("/report/ScheduleTracker");
	else if(by === 'ProductionTracker')
		res.redirect("/report/ProductionTracker");
});

//=======================================================================================

module.exports = app;
