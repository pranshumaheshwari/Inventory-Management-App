var express 	   							 = require('express'),
		{selectQuery, insertQuery} = require('../config/query.js'),
		logger    	    					 = require('../config/winston').output,
		app      		    					 = express.Router();

//=======================================================================================
//																		GET
//=======================================================================================

// let q = `SELECT code FROM raw_material`
// selectQuery(q)
// 	.then(raw => {
// 		for(let r of raw) {
// 			q = `INSERT INTO requisition_output SET ?`
// 			let o = {
// 				req_id: 0,
// 				RM_code: r.code,
// 				quantity: 0
// 			}
// 			insertQuery(q, o)
// 		}
// 	})

app.get(`/temp`, async (req, res) => {
	let q = `SELECT code FROM raw_material ORDER BY code`
	let raw = await selectQuery(q)
	for(let r of raw) {
		q = `SELECT COALESCE(SUM(ro.quantity),0) issued_quantity FROM requisition_output ro LEFT OUTER JOIN requisition r ON r.id = ro.req_id WHERE ro.RM_code = "${r.code}"`
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
		q = `SELECT quantity FROM requisition_output WHERE req_id = 0 AND RM_code = "${r.code}"`
		r.total_quantity += await selectQuery(q)
									.then(result => result[0].quantity)
									.catch(err => {
										logger.error({
												error: err,
												where: `${ req.method } ${ req.url } ${ q }`,
												time: (new Date()).toISOString()
										});
										res.render('error',{error: err})
										res.end()
									});
		q = `SELECT COALESCE(SUM(r.quantity * fd.quantity),0) total FROM finished_goods_detail fd INNER JOIN requisition r ON fd.code = r.FG_code WHERE fd.raw_material_code = "${r.code}"`
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

	res.render("temp", {data: raw})
})

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
	let q = `
			SELECT
				r.id, r.FG_code, r.quantity, r.status, r.date,
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
					q = `SELECT COALESCE(SUM(ro.quantity),0) issued_quantity FROM requisition_output ro LEFT OUTER JOIN requisition r ON r.id = ro.req_id WHERE ro.RM_code = "${r.RM_code}" AND ro.req_id < ${r.id} AND r.status="Running"`
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
					q = `SELECT quantity FROM requisition_output WHERE req_id = 0 AND RM_code = "${r.RM_code}"`
					r.total_quantity += await selectQuery(q)
												.then(result => result[0].quantity)
												.catch(err => {
													logger.error({
															error: err,
															where: `${ req.method } ${ req.url } ${ q }`,
															time: (new Date()).toISOString()
													});
													res.render('error',{error: err})
													res.end()
												});
					q = `SELECT COALESCE(SUM(r.quantity * fd.quantity),0) total FROM finished_goods_detail fd INNER JOIN requisition r ON fd.code = r.FG_code WHERE fd.raw_material_code = "${r.RM_code}" AND r.id < ${r.id} AND r.status="Running"`
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

app.get("/requisition/:id/close", (req, res) => {
	let q = `UPDATE requisition SET status = "Closed" WHERE id = ${req.params.id}`
	selectQuery(q)
		.then(data => {
			res.redirect("/requisition")
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
	res.redirect(`/requisition`)
	let id = req.params.id
	let q = ``
	for (let [key, value] of Object.entries(req.body)) {
		value = parseFloat(value)
		let total_issued_quantity = value

		// ADD EXCESS ON LINE TO THE QUANTITY
		q = `SELECT quantity FROM requisition_output WHERE req_id = 0 AND RM_code = "${key}"`
		await selectQuery(q)
					.then(data => data[0].quantity)
					.then(q => {
						if(q != 0) value += q
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
		if(value == 0) continue;

		// CURRENT REQUISITION

		q = `SELECT r.id id, r.quantity * fd.quantity required_quantity FROM requisition r INNER JOIN finished_goods_detail fd ON r.FG_code = fd.code WHERE fd.raw_material_code = "${key}" AND r.id = ${id}`
		let requisition = await selectQuery(q)
						.then(data => data[0])
						.catch(err => {
							logger.error({
									error: err,
									where: `${ req.method } ${ req.url } ${ q }`,
									time: (new Date()).toISOString()
							});
							res.render('error',{error: err});
							res.end()
						});
		let totalValue = 0
		q = `SELECT COALESCE(SUM(quantity),0) issued_quantity FROM requisition_output WHERE req_id = ${requisition.id} AND RM_code = "${key}"`
		requisition.issued_quantity = await selectQuery(q)
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
		let val = requisition.required_quantity - requisition.issued_quantity
		if(isNaN(total_issued_quantity)) total_issued_quantity = 0
		if(val != 0) {
			q = `INSERT INTO requisition_output SET ?`
			let output = {
				req_id: requisition.id,
				RM_code: key,
				quantity: val,
				issuing_req_id: id,
				issuing_quantity: total_issued_quantity,
			}
			if (val + totalValue > value) {
				output.quantity = value - totalValue
				totalValue = value
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
			} else {
				totalValue += val
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
			}
		}

		// GET ALL REQUISITION WITH id < CURRENT id

		q = `SELECT r.id id, r.quantity * fd.quantity required_quantity FROM requisition r INNER JOIN finished_goods_detail fd ON r.FG_code = fd.code WHERE fd.raw_material_code = "${key}" AND (r.status = "Running" AND r.id < ${id}) ORDER BY r.id`
		let requisitions = await selectQuery(q)
								.catch(err => {
									logger.error({
											error: err,
											where: `${ req.method } ${ req.url } ${ q }`,
											time: (new Date()).toISOString()
									});
									res.render('error',{error: err});
									res.end()
								});
		for(let requisition of requisitions) {
			q = `SELECT COALESCE(SUM(quantity),0) issued_quantity FROM requisition_output WHERE req_id = ${requisition.id} AND RM_code = "${key}"`
			requisition.issued_quantity = await selectQuery(q)
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
			let val = requisition.required_quantity - requisition.issued_quantity
			if(val == 0) continue;
			q = `INSERT INTO requisition_output SET ?`
			let output = {
				req_id: requisition.id,
				RM_code: key,
				quantity: val,
				issuing_req_id: id,
				issuing_quantity: total_issued_quantity,
			}
			if (val + totalValue > value) {
				output.quantity = value - totalValue
				totalValue = value
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
				break;
			} else {
				totalValue += val
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
			}
		}

		// UPDATE REQUISITION STATUS IF COMPLETED

		requisitions.push({ id })
		for(let requisition of requisitions) {
			let q = `SELECT fd.raw_material_code RM_code, r.quantity * fd.quantity required_quantity FROM requisition r INNER JOIN finished_goods_detail fd ON r.FG_code = fd.code WHERE r.id = ${requisition.id}`
			let RM = await selectQuery(q)
							.catch(err => {
								logger.error({
										error: err,
										where: `${ req.method } ${ req.url } ${ q }`,
										time: (new Date()).toISOString()
								});
								res.render('error',{error: err});
								res.end()
							});
			let isCompleted = true
			for(let r of RM) {
				q = `SELECT COALESCE(SUM(quantity),0) issued_quantity FROM requisition_output WHERE req_id = ${id} AND RM_code = "${r.RM_code}"`
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
				if (Math.abs(r.required_quantity - r.issued_quantity) > 1) {
					isCompleted = false
					break
				}
			}
			if (isCompleted) {
				q = `UPDATE requisition SET status = "Closed" WHERE id = ${id}`
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
			} else {
				q = `UPDATE requisition SET status = "Running" WHERE id = ${id}`
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
			}
		}

		// UPDATE EXCESS ON LINE VALUE 

		q = `UPDATE requisition_output SET quantity = ${value - totalValue} WHERE RM_code = "${key}" AND req_id = 0`
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

		// UPDATE STOCK OF RAW MATERIAL

		q = `UPDATE raw_material SET stock = (stock - ${total_issued_quantity}), line_stock = (line_stock + ${total_issued_quantity}) WHERE code = '${key}'`
		await selectQuery(q)
					.then(result => {
						logger.info({
							where: `${ req.method } ${ req.url } ${ q }`,
							what: value,
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
	// res.redirect(`/requisition`)
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
