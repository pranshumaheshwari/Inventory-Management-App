var express 	   							 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js'),
		logger    	    					 = require('../config/winston').output,
		app      		    					 = express.Router();

//=======================================================================================
//																		GET
//=======================================================================================

app.get(`/api/finishedGoods`, async (req, res) => {
	if(req.query.category) {
		let q = `SELECT * FROM finished_goods WHERE category = "${req.query.category}"`
		selectQuery(q)
			.then(data => {
				res.send(data)
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
	} else {

	}
})

app.get("/output",async function(req,res){
	var q = "SELECT * FROM raw_material";
	await selectQuery(q)
						.then(raw_materials => {
							res.render("output",{raw_materials:raw_materials});
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

app.get("/output/:slip_no", async (req, res) => {
	var q = `SELECT * FROM output WHERE slip_no = '${ req.params.slip_no }'`;
	await selectQuery(q)
						.then(raw_materials => {
							raw_materials.length !== 0 ? res.render("update_delete_output",{raw_materials:raw_materials}) : res.redirect("/output");
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

app.get("/requisition", (req, res) => {
	if(!req.query.status)
		res.render("requisition")
	else {
		let q = `SELECT * FROM requisition WHERE status = "${req.query.status}"`
		selectQuery(q)
			.then(data => {
				res.send(data)
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

app.get("/requisition/new", (req, res) => {
	let q = `SELECT DISTINCT category FROM finished_goods`
	selectQuery(q)
			.then(finished_goods_categories => {
				res.render("requisition_new", {finished_goods_categories})
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

app.get("/requisition/:id", (req, res) => {
	let id = req.params.id
	// let q = `SELECT r.*, rd.*, raw.name RM_name
	// 		 FROM requisition r, requisition_details rd, raw_material raw
	// 		 WHERE r.id = rd.req_id AND rd.RM_code = raw.code`
	// let q = `SELECT r.*, raw.name RM_name, fd.raw_material_code RM_code, fd.quantity * r.quantity required_quantity
	// 		 FROM requisition r, raw_material raw, finished_goods_detail fd
	// 		 WHERE r.id = ${id} AND r.FG_code = fd.code AND fd.raw_material_code = raw.code`
	let q = `
			SELECT
				r.id, r.FG_code, r.quantity, r.status,
				fd.raw_material_code RM_code, fd.quantity * r.quantity required_quantity,
				raw.name RM_name, raw.stock
			FROM
				requisition r
			INNER JOIN
				finished_goods_detail fd 
			ON
				r.FG_code = fd.code
			INNER JOIN
				raw_material raw
			ON
				raw.code = fd.raw_material_code
			WHERE
				r.id = ${id}
			`
	selectQuery(q)
			.then(async data => {
				for (var r of data) {
					var today = new Date()
					q = `SELECT COALESCE(SUM(quantity),0) issued_quantity FROM requisition_output WHERE req_id = ${r.id} AND RM_code = "${r.RM_code}"`
					r.issued_quantity = await selectQuery(q)
												.then(result => result[0].issued_quantity)
												.catch(err => {
													logger.error({
															error: err,
															where: `${ req.method } ${ req.url } ${ q }`,
															time: (new Date()).toISOString()
													});
													res.render('error',{error: err})
													res.end()
												});

					q = `SELECT COALESCE(SUM(ro.quantity),0) issued_quantity FROM requisition_output ro LEFT OUTER JOIN requisition r ON r.id = ro.req_id WHERE ro.RM_code = "${r.RM_code}" AND MONTH(r.date) = "${today.getMonth() + 1}" AND ro.req_id <= "${r.id}" AND (r.status="Running" OR r.status = "Closed")`
					r.total_quantity = await selectQuery(q)
												.then(result => result[0].issued_quantity)
												.catch(err => {
													logger.error({
															error: err,
															where: `${ req.method } ${ req.url } ${ q }`,
															time: (new Date()).toISOString()
													});
													res.render('error',{error: err})
													res.end()
												});
					q = `SELECT COALESCE(SUM(r.quantity * fd.quantity),0) total FROM finished_goods_detail fd INNER JOIN requisition r ON fd.code = r.FG_code WHERE fd.raw_material_code = "${r.RM_code}" AND MONTH(r.date) = "${today.getMonth() + 1}" AND r.id <= "${r.id}" AND (r.status="Running" OR r.status = "Closed")`
					r.total_required_quantity = await selectQuery(q)
													.then(result => result[0].total)
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
				res.render("input_requisition", {data});
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

//=======================================================================================
//																		POST
//=======================================================================================

app.post("/output",async function(req,res){
	for(var i=0;i<req.body.product_code.length;i++){
		let o = {
			slip_no: req.body.slip_no[0],
			raw_material_code: req.body.product_code[i],
			quantity: req.body.Quantity[i]
		}
		var q = "INSERT INTO output SET ?";
		await insertQuery(q, o)
							.then(async result => {
								logger.info({
									where: `${ req.method } ${ req.url } ${ q }`,
									what: o,
									time: (new Date()).toISOString()
								});
								q = "UPDATE raw_material SET stock = (stock - " + o.quantity + "), line_stock = (line_stock + " + o.quantity + ") WHERE code = '" + o.raw_material_code + "'";
								await selectQuery(q)
													.then(result => {
														logger.info({
															where: `${ req.method } ${ req.url } ${ q }`,
															what: o,
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
	res.redirect("/output");
});

app.post("/requisition/new", (req, res) => {
	let data = req.body
	var q = "INSERT INTO requisition SET ?"
	insertQuery(q, data)
			.then(async result => {
				logger.info({
					where: `${ req.method } ${ req.url } ${ q }`,
					what: data,
					time: (new Date()).toISOString()
				});
				res.redirect(`/requisition/${result.insertId}`)
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

app.post("/requisition/:id", async (req, res) => {
	let id = req.params.id
	
	for (let [key, value] of Object.entries(req.body)) {
		if (value == 0) continue;
		let q = `INSERT INTO requisition_output SET ?`
		let output = {
			req_id: id,
			RM_code: key,
			quantity: value
		}
		await insertQuery(q, output)
					.then(result => {
						logger.info({
							where: `${ req.method } ${ req.url } ${ q }`,
							what: output,
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

		q = `UPDATE raw_material SET stock = (stock - ${value}), line_stock = (line_stock + ${value}) WHERE code = '${key}'`
		await selectQuery(q)
					.then(result => {
						logger.info({
							where: `${ req.method } ${ req.url } ${ q }`,
							what: output,
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

	let q = `SELECT f.raw_material_code RM_code, r.quantity * f.quantity quantity FROM requisition r INNER JOIN finished_goods_detail f ON f.code = r.FG_code WHERE r.id = ${id}`
	let RM_code = await selectQuery(q)
							.catch(err => {
								logger.error({
										error: err,
										where: `${ req.method } ${ req.url } ${ q }`,
										time: (new Date()).toISOString()
								});
								res.render('error',{error: err});
								res.end()
							});
	
	let status = true
	for (var r of RM_code) {
		var today = new Date()
		q = `SELECT COALESCE(SUM(quantity),0) issued_quantity FROM requisition_output WHERE req_id = ${id} AND RM_code = "${r.RM_code}"`
		status = status && await selectQuery(q)
								.then(result => result[0].issued_quantity)
								.then(issued_quantity => {
									return (issued_quantity >= r.quantity)
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

	status = status ? "Closed" : "Running"
	q = `UPDATE requisition SET status = "${status}" WHERE id = ${id}`
	await selectQuery(q)
			.catch(err => {
				logger.error({
						error: err,
						where: `${ req.method } ${ req.url } ${ q }`,
						time: (new Date()).toISOString()
				});
				res.render('error',{error: err});
				res.end()
			});
	res.redirect(`/requisition`)
});

//=======================================================================================
//																		DELETE
//=======================================================================================

app.delete("/output/:slip_no", async (req,res) => {
	var q = `SELECT * FROM output WHERE slip_no = '${ req.params.slip_no }'`;
	await selectQuery(q)
						.then(async raw_materials => {
							await raw_materials.forEach(async raw_material => {
								q = `UPDATE raw_material SET stock = (stock + ${ raw_material.quantity }), line_stock = (line_stock - ${ raw_material.quantity }) WHERE code = '${ raw_material.raw_material_code }'`;
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
						})
						.then(async _ => {
							q = `DELETE FROM output WHERE slip_no = ${ req.params.slip_no }`;
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
						})
						.then( _ => {
							res.redirect(`/output`);
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

app.delete("/output/:slip_no/:raw_material_code", async (req,res) => {
	var q = `SELECT * FROM output WHERE slip_no = '${ req.params.slip_no }' AND raw_material_code = '${ req.params.raw_material_code }'`;
	await selectQuery(q)
						.then(async raw_materials => {
							await raw_materials.forEach(async raw_material => {
								q = `UPDATE raw_material SET stock = stock + ${ raw_material.quantity }, line_stock = line_stock - ${ raw_material.quantity } WHERE code = '${ raw_material.raw_material_code }'`;
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
						})
						.then(async _ => {
							q = `DELETE FROM output WHERE slip_no = '${ req.params.slip_no }' AND raw_material_code = '${ req.params.raw_material_code }'`;
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
						})
						.then( _ => {
							res.redirect(`/output/${ req.params.slip_no }`);
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
