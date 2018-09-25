var express 	   = require('express'),
	mysql 	  	   = require('mysql'),
	bodyParser 	   = require('body-parser'),
	methodOverride = require('method-override'),
	app      	   = express.Router();

var con = mysql.createConnection({
	host: "localhost",
  	user: "root",
  	password: "",
  	database: "Store"
});

app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

app.get("/BOM",function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY category";
	con.query(q,function(err,finishedGoods){
		if(err)
			res.render("error");
		else {
			res.render("BOM",{finishedGoods:finishedGoods,mock:false});
		}
	});
});

app.post("/BOM",function(req,res){
	var finished_good_code = req.body.finished_code;
	var quantity = req.body.quantity;
	for(var i=0;i<finished_good_code.length;i++){
		var q = "UPDATE finished_goods SET quantity ='" + quantity[i] + "' WHERE code ='" + finished_good_code[i] + "'";
		con.query(q,function(err){
			if(err)
				res.render("error");
		});
	}
	q = "UPDATE raw_material SET monthly_requirement = 0";
	con.query(q,function(err){
		if(err)
			res.render("error");
	});
	var raw_quantity = {};
	q = "SELECT * FROM raw_material";
	con.query(q,function(err,raw_materials){
		if(err)
			res.render("error");
		else {
			for(var k=0;k<raw_materials.length;k++){
				raw_quantity[raw_materials[k].code] = 0;
				if(k === raw_materials.length - 1){
					q = "SELECT * FROM finished_goods ORDER BY code";
					con.query(q,function(err,finishedGoods){
						if(err)
							res.render("error");
						else {
							for(var i=0;i<finishedGoods.length;i++){
								q = "SELECT * FROM finished_goods_detail WHERE code='" + finishedGoods[i].code + "'";
								con.query(q,function(err,raw_materials){
									if(err)
										res.render("error");
									else {
										if(i === finishedGoods.length)
											i = 0;
										for(var j=0;j<raw_materials.length;j++){
											var raw_q = finishedGoods[i].quantity * raw_materials[j].quantity;
											raw_quantity[raw_materials[j].raw_material_code] += raw_q;
											// q = "SELECT * FROM raw_material WHERE code = '" + raw_materials[j].raw_material_code + "'";
											// con.query(q,function(err,raw_material){
											// 	if(err)
											// 		throw err;
											// 	else {
											// 	if(raw_material[0] != undefined){
											// 		if(j === raw_materials.length)
											// 			j = 0;
											// 		var monthly_req = raw_material[0].monthly_requirement;
											// 		monthly_req += raw_quantity[raw_material.code];
											// 		q = "UPDATE raw_material SET monthly_requirement = '" + monthly_req + "' WHERE code = '" + raw_material[0].code + "'";
											// 		con.query(q,function(err){
											// 			if(err)
											// 				throw err;
											// 		});
											// 		j++;
											// 	}
											// }});
										}
										i++;
									}
								});
								if(i === finishedGoods.length-1){
									setTimeout(function(){
										q = "SELECT * FROM raw_material";
										con.query(q,function(err,raw_materials){
											if(err)
												res.render("error");
											else {
												for(var i=0;i<raw_materials.length;i++){
													q = "UPDATE raw_material SET monthly_requirement = '" + raw_quantity[raw_materials[i].code] + "' WHERE code='" + raw_materials[i].code + "'";
													con.query(q,function(err){
														if(err)
															res.render("error");
													});
												}
											}
										});
										setTimeout(function(){
											q = "SELECT * FROM raw_material ORDER BY supplier_code ";
											con.query(q,function(err,raw_materials){
											if(err)
												res.render("error");
											var w;
											var r = [];
											for(var p=0;p<raw_materials.length;p++){
												if(raw_materials[p].monthly_requirement > 0){
													r.push(raw_materials[p]);
												}
											}
											res.render("BOM_manual",{raw_materials:r,w:w,mock:false});
											});
										},3000);
									},3000);
								}
							}
						}
					});
				}
			}
		}
	});
});

app.get("/finished_good",function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY category";
	con.query(q,function(err,finished_goods){
		if(err)
			throw err;
		else {
			res.render("finished_good",{finished_goods:finished_goods});
		}
	});
});

app.get("/finished_good/new",function(req,res){
	var q = "SELECT * FROM raw_material ORDER BY name";
	con.query(q,function(err,raw_materials){
		if(err)
			res.render("error");
		else {
			res.render("new_finished_good",{raw_materials:raw_materials});
		}
	});
});

app.get("/finished_good/mock",function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY code";
	con.query(q,function(err,finished_goods){
		if(err)
			res.render("error");
		else {
			res.render("BOM",{finishedGoods:finished_goods,mock:true});
		}
	});
});

app.get("/finished_good/reset",function(req,res){
	var q = "UPDATE finished_goods SET quantity = 0";
	con.query(q,function(err){
		if(err)
			res.render("error");
	});
	res.redirect("/finished_good");
});

app.get("/finished_good/create",function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY code";
	con.query(q,function(err,finished_goods){
		if(err)
			res.render("error");
		else
			res.render("input_finished_good",{finished_goods:finished_goods});
	});
});

app.get("/finished_good/PD",function(req,res){
	res.render("PD");
});

app.get("/finished_good/dispatch",function(req,res){
	var q = "SELECT * FROM finished_goods ORDER BY code";
	con.query(q,function(err,finished_goods){
		if(err)
			res.render("error");
		else{
			res.render("dispatch",{finished_goods:finished_goods});
		}
	});
});

app.get("/finished_good/:code",function(req,res){
	var code = req.params.code;
	var q = "SELECT * FROM finished_goods WHERE code='" + code + "'";
	con.query(q,function(err,finished_good){
		if(err)
			res.render("error");
		else {
			q = "SELECT * FROM finished_goods_detail WHERE code='" + code + "' ORDER BY raw_material_code";
			con.query(q,function(err,raw_materials){
				if(err)
					res.render("error");
				else {
					q = "SELECT * FROM raw_material";
					con.query(q,function(err,raw){
						if(err)
							res.render("error");
						else
							res.render("update_delete_finished_good",{finished_good:finished_good[0],raw_materials:raw_materials,raw:raw});
					});
				}
			});
		}
	});
});

app.get("/finished_good/BOM/:code",function(req,res){
	var code = req.params.code,Name;
	var q = "SELECT name FROM finished_goods WHERE code ='" + code + "'";
	con.query(q,function(err,name){
		if(err)
			res.render("error");
		Name = name[0].name;
	});
	var q = "SELECT f.*,r.name,r.stock FROM (SELECT * FROM finished_goods_detail WHERE code='" + code + "') AS f INNER JOIN raw_material AS r ON r.code = f.raw_material_code ORDER BY f.raw_material_code";
	con.query(q,function(err,raw_materials){
		if(err)
			res.render("error");
		else {
			res.render("FG_BOM",{raw_materials:raw_materials,code:code,name:Name});
		}
	});
});

app.get("/finished_good/:code/new",function(req,res){
	var q = "SELECT * FROM raw_material";
	con.query(q,function(err,raw){
		if(err)
			res.render("error");
		else
			res.render("new_raw_finished_good",{raw:raw,code:req.params.code});
	});
});

app.get("/finished_good/:code/delete",function(req,res){
	var q = "DELETE FROM finished_goods WHERE code='" + req.params.code + "'";
	con.query(q,function(err){
		if(err)
			res.render("error");
	});
	q = "DELETE FROM finished_goods_detail WHERE code='" + req.params.code + "'";
	con.query(q,function(err){
		if(err)
			res.render("error");
	});
	res.redirect("/finished_good");
});

app.get("/finished_good/:code/:raw/delete",function(req,res){
	var q = "DELETE FROM finished_goods_detail WHERE code='" + req.params.code + "' AND raw_material_code='" + req.params.raw + "' LIMIT 1";
	con.query(q,function(err){
		if(err)
			res.render("error");
	});
	res.redirect("/finished_good/" + req.params.code);
});

app.post("/finished_good/dispatch",function(req,res){
	var invoice = req.body.invoice;
	var quantity = req.body.quantity;
	var product = req.body.product;
	for(var i=0;i<product.length;i++){
		var q = "UPDATE finished_goods SET stock = stock - " + quantity[i] + " WHERE code ='" + product[i] + "'";
		con.query(q,function(err){
			if(err)
				res.render("error");
		});
		var dis = {
			invoice_no: invoice,
			FG_code: product[i],
			quantity: quantity[i]
		}
		q = "INSERT INTO dispatch SET ?";
		con.query(q,dis,function(err){
			if(err)
				res.render("error");
		});
	}
	res.redirect("/finished_good/dispatch");
});

app.post("/finished_good/create",function(req,res){
	var code = req.body.finished_goods_code;
	var quantity = req.body.quantity;
	for(var i=0;i<code.length;i++){
		var raw_materials = [];
		var q = "UPDATE finished_goods SET stock = stock + " + quantity[i] + " WHERE code ='" + code[i] + "'";
		con.query(q,function(err){
			if(err)
				res.render("error");
		});
		var obj = {
			FG_code: code[i],
			quantity: quantity[i]
		};
		q = "INSERT INTO production SET ?";
		con.query(q,obj,function(err){
			if(err)
				res.render("error");
		});
		q = "SELECT raw_material_code,quantity FROM finished_goods_detail WHERE code = '" + code[i] + "'";
		con.query(q,function(err,raw){
			if(err)
				res.render("error");
			else {
				raw_material = raw;
			}
		});
		for(var j=0;j<raw_materials.length;j++){
			q = "UPDATE raw_material SET line_stock = line_stock - (" + quantity[i] + " * " + raw_material[j].quantity + ") WHERE code ='" + raw_material[j].raw_material_code + "'";
			con.query(q,function(err){
				if(err)
					res.render("error");
			});
		}
	}
	res.redirect("/finished_good/create");
});

app.post("/finished_good/mock",function(req,res){
	var finished_good_code = req.body.finished_code;
	var quantity = req.body.quantity;
	var raw_quantity = {};
	q = "SELECT * FROM raw_material";
	con.query(q,function(err,raw_materials){
		if(err)
			res.render("error");
		else {
			for(var k=0;k<raw_materials.length;k++){
				raw_quantity[raw_materials[k].code] = 0;
				if(k === raw_materials.length - 1){
					q = "SELECT * FROM finished_goods ORDER BY code";
					con.query(q,function(err,finishedGoods){
						if(err)
							res.render("error");
						else {
							for(var i=0;i<finishedGoods.length;i++){
								q = "SELECT * FROM finished_goods_detail WHERE code='" + finishedGoods[i].code + "'";
								con.query(q,function(err,raw_materials){
									if(err)
										res.render("error");
									else {
										if(i === finishedGoods.length)
											i = 0;
										for(var j=0;j<raw_materials.length;j++){
											var raw_q = quantity[i] * raw_materials[j].quantity;
											raw_quantity[raw_materials[j].raw_material_code] += raw_q;
										}
										i++;
									}
								});
								if(i === finishedGoods.length-1){
									setTimeout(function(){
										q = "SELECT * FROM raw_material ORDER BY supplier_code";
										con.query(q,function(err,raw_materials){
										if(err)
											throw err;
										var w;
										var r = [];
										for(var p=0;p<raw_materials.length;p++){
											if(raw_quantity[raw_materials[p].code]){
												r.push(raw_materials[p]);
											}
										}
										res.render("BOM_manual",{raw_materials:r,w:w,mock:true,raw_quantity:raw_quantity });
										});
									},3000);
								}
							}
						}
					});
				}
			}
		}
	});
});

app.post("/finished_good/search/category",function(req,res){
	var q = "SELECT * FROM finished_goods WHERE category ='" + req.body.category + "'";
	con.query(q,function(err,finished_goods){
		if(err)
			res.render("error");
		else
			res.render("finished_good",{finished_goods:finished_goods});
	});
});

app.post("/finished_good/new",function(req,res){
	var q = "INSERT INTO finished_goods SET ?";
	var raw_materials = req.body.product_code;
	var quantity = req.body.quantity;
	con.query(q,req.body.finished_good,function(err){
		if(err)
			res.render("error");
	});
	q = "INSERT INTO finished_goods_detail SET ?";
	for(var i=0;i<quantity.length;i++){
		var raw_material = {
			code: req.body.finished_good.code,
			raw_material_code: raw_materials[i],
			quantity: quantity[i]
		}
		con.query(q,raw_material,function(err){
			if(err)
				res.render("error");
		});
	}
	res.redirect("/");
});

app.post("/finished_good/:code/update",function(req,res){
	var finished_good = req.body.finished_good;
	var code = req.body.code;
	var quantity = req.body.quantity;
	var q = "UPDATE finished_goods SET ? WHERE code ='" + req.params.code + "'";
	con.query(q,finished_good,function(err){
		if(err)
			res.render("error");
	});
	q = "DELETE FROM finished_goods_detail WHERE code='" + req.params.code + "'";
	con.query(q,function(err){
		if(err)
			res.render("error");
	});
	for(var i=0;i<code.length;i++){
		q = "INSERT INTO finished_goods_detail SET ?";
		var raw = {
			code: finished_good.code,
			raw_material_code: code[i],
			quantity: quantity[i]
		}
		con.query(q,raw,function(err){
			if(err)
				res.render("error");
		});
	}
	res.redirect("/finished_good");
});

app.post("/finished_good/:code/new",function(req,res){
	var raw = {
		code: req.params.code,
		raw_material_code: req.body.newCode,
		quantity: req.body.newQuantity
	}
	var q ="INSERT INTO finished_goods_detail SET ?";
	con.query(q,raw,function(err){
		if(err)
			res.render(err);
	});
	res.redirect("/finished_good/" + req.params.code);
});

module.exports = app;
