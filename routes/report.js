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

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

app.get("/report",function(req,res){
	res.render("reports");
});

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
		res.redirect("/report/FG_Name")
});

app.get("/report/FG_Name",function(req,res){
	var q = "SELECT name,code FROM finished_goods ORDER BY code";
	con.query(q,function (err,finished_goods) {
		if(err)
			res.render("error");
		else {
			res.render("report_P-D",{type:"FG_Name",finished_goods:finished_goods});
		}
	});
});

app.post("/report/FG_Name",async function(req,res){
	var from = req.body.from;
	var to = req.body.to;
	var finished_good_code = req.body.name;
	var currentStock,totalExchange,closingStock,openingStock,finished_good,finished_goods;
	var q = "SELECT * FROM finished_goods WHERE code ='" + finished_good_code + "'";
	await con.query(q,function(err,Finished_good){
		if(err)
			res.render("error");
		else {
			Finished_good = Finished_good[0];
			currentStock = Finished_good.stock;
			finished_good = Finished_good;
		}
	});
	setTimeout(async function(){
		q = "SELECT SUM(quantity) AS sum FROM production WHERE date >='" + from + "' AND date <='" + to + "' + INTERVAL 1 DAY AND FG_code ='" + finished_good_code + "' ";
		q += "UNION SELECT SUM(quantity) AS sum FROM dispatch WHERE date >='" + from + "' AND date <='" + to + "' + INTERVAL 1 DAY AND FG_code ='" + finished_good_code + "'";
		await con.query(q,function(err,sum){
			if(err)
				throw err;
			else {
				totalExchange = sum[0].sum - sum[1].sum;
			}
		});
		setTimeout(async function(){
			q = "SELECT SUM(quantity) AS sum FROM production WHERE date >'" + to + "' + INTERVAL 1 DAY AND FG_code ='" + finished_good_code + "' ";
			q += "UNION SELECT SUM(quantity) AS sum FROM dispatch WHERE date >'" + to + "' + INTERVAL 1 DAY AND FG_code ='" + finished_good_code + "'";
			await con.query(q,function(err,sum){
				if(err)
					throw err;
				else {
					console.log(sum);
					if(!sum[0].sum){
						closingStock = currentStock;
					}
					else if(!sum[1].sum){
						sum[1].sum = 0;
						closingStock = currentStock + sum[1].sum - sum[0].sum;
					} else {
						closingStock = currentStock + sum[1].sum - sum[0].sum;
					}
					console.log(closingStock);
				}
			});
			setTimeout(async function(){
				openingStock = closingStock - totalExchange;
				q = "SELECT * ,'p' AS type FROM production WHERE FG_code ='" + finished_good_code + "' AND date >='" + from + "' AND date <='" + to + "' + INTERVAL 1 DAY ORDER by date ";
				await con.query(q,async function(err,fg){
					if(err)
						throw err;
					else 
						finished_goods = fg;
				});
				setTimeout(async function(){
					q = "SELECT * FROM dispatch WHERE FG_code ='" + finished_good_code + "' AND date >='" + from + "' AND date <='" + to + "' + INTERVAL 1 DAY ORDER by date"
					await con.query(q,async function(err,fg){
						if(err)
							throw err;
						else{
							finished_goods.push(...fg);
						}
					});
				},100);
				setTimeout(async function(){
					await finished_goods.sort(function(a,b){
						var dateA = new Date(a.date);
						var dateB = new Date(b.date);
	    				return dateA-dateB;
					});
					res.render("report_pd",{finished_goods:finished_goods,openingStock:openingStock,closingStock:closingStock,to:to,from:from,finished_good:finished_good,t:'FGName',totalExchange:totalExchange});
				},300);
			},100);
		},100);
	},100);
});

app.get("/report/date",function(req,res){
	res.render("report_FG-date");
});

app.post("/report/date",function(req,res){
	var type = req.body.type;
	var to = req.body.to;
	var from = req.body.from;
	var q = "SELECT * FROM " + type + " WHERE date >= '" + from + "' AND date <= '" + to + "' ORDER BY date";
	con.query(q,function(err,finished_goods){
		if(err)
			res.render("error");
		else {
			res.render("report_FG-date_data",{finished_goods:finished_goods,type:type,from:from,to:to});
		}
	});
});

app.get("/report/production",function (req,res) {
	var q = "SELECT name,code FROM finished_goods ORDER BY code";
	con.query(q,function (err,finished_goods) {
		if(err)
			res.render("error");
		else {
			res.render("report_P-D",{type:"production",finished_goods:finished_goods});
		}
	});
});

app.post("/report/production",async function(req,res){
	var from = req.body.from;
	var to = req.body.to;
	var finished_good_code = req.body.name;
	var totalExchange,finished_good;
	var q = "SELECT * FROM finished_goods WHERE code ='" + finished_good_code + "'";
	await con.query(q,await function(err,Finished_good){
		if(err)
			throw err;
		else {
			Finished_good = Finished_good[0];
			currentStock = Finished_good.stock;
			finished_good = Finished_good;
		}
	});
	setTimeout(async function(){
		q = "SELECT SUM(quantity) AS sum FROM production WHERE date >='" + from + "' AND date <='" + to + "' AND FG_code ='" + finished_good_code + "'";
		await con.query(q,await function(err,sum){
			if(err)
				throw err;
			else {
				sum = sum[0];
				if(sum.sum)
					totalExchange = sum.sum;
				else
					totalExchange = 0;
			}
		});
		setTimeout(async function(){				
			q = "SELECT * FROM production WHERE FG_code ='" + finished_good_code + "' AND date >='" + from + "' AND date <='" + to + "' ORDER by date";
			await con.query(q,await function(err,finished_goods){
				if(err)
					throw err;
				else {
					res.render("report_pd",{t:'production',finished_goods:finished_goods,openingStock:0,closingStock:0,to:to,from:from,finished_good:finished_good,totalExchange:totalExchange});
				}
			});
		},100);
	},100);
});

app.get("/report/dispatch",function(req,res){
	var q = "SELECT name,code FROM finished_goods ORDER BY code";
	con.query(q,function (err,finished_goods) {
		if(err)
			res.render("error");
		else {
			res.render("report_P-D",{type:"dispatch",finished_goods:finished_goods});
		}
	});
});

app.post("/report/dispatch",async function(req,res){
	var from = req.body.from;
	var to = req.body.to;
	var finished_good_code = req.body.name;
	var totalExchange,finished_good;
	var q = "SELECT * FROM finished_goods WHERE code ='" + finished_good_code + "'";
	await con.query(q,function(err,Finished_good){
		if(err)
			res.render("error");
		else {
			Finished_good = Finished_good[0];
			currentStock = Finished_good.stock;
			finished_good = Finished_good;
		}
	});
	setTimeout(async function(){
		q = "SELECT SUM(quantity) AS sum FROM dispatch WHERE date >='" + from + "' AND date <='" + to + "' AND FG_code ='" + finished_good_code + "'";
		await con.query(q,function(err,sum){
			if(err)
				res.render("error");
			else {
				sum = sum[0];
				if(sum.sum)
					totalExchange = sum.sum;
				else
					totalExchange = 0;
			}
		});
		setTimeout(async function(){
			q = "SELECT * FROM dispatch WHERE FG_code ='" + finished_good_code + "' AND date >='" + from + "' AND date <='" + to + "' ORDER by date";
			await con.query(q,function(err,finished_goods){
				if(err)
					res.render("error");
				else {
					res.render("report_pd",{finished_goods:finished_goods,openingStock:0,closingStock:0,to:to,from:from,finished_good:finished_good,t:'dispatch',totalExchange:totalExchange});
				}
			});
		},100);
	},100);
});

app.get("/report/name",function(req,res){
	var q = "SELECT * FROM raw_material ORDER BY name";
	con.query(q,function(err,raw_materials){
		if(err)
			res.render("error");
		else {
			res.render("report_by_name",{raw_materials:raw_materials});
		}
	});
});

app.post("/report/name",function(req,res){
	var raw = req.body.raw_material.split("$");
	var q = "SELECT * FROM raw_material WHERE code = '" + raw[0] + "'";
	con.query(q,function(err,raw_materials){
		if(err)
			throw err;
		else {
			var raw_material = raw_materials[0];
			var Dateto = req.body.to.split("-"), Datefrom = req.body.from.split("-");
			var to = new Date(Dateto[0],parseInt(Dateto[1])-1,Dateto[2]);
			var from = new Date(Datefrom[0],parseInt(Datefrom[1])-1,Datefrom[2]);
			var input_output = [], openingStock, closingStock;
			var currentStock = raw_material.stock;
			q = "SELECT * FROM input WHERE DTPL_code ='" + raw[1] + "'AND raw_desc='" + raw[2] + "' ORDER BY date";
			con.query(q,function(err,inputs){
				if(err)
					throw err;
				else {
					q = "SELECT * FROM output WHERE raw_material_code ='" + raw_material.code + "' ORDER BY date";
					con.query(q,function(err,outputs){
						if(err)
							throw err;
						else {
							closingStock = currentStock;
							for(var i=0;i<inputs.length;i++){
								if(inputs[i].date > new Date(to.getTime() + (24*60*60*1000))){
									closingStock -= inputs[i].quantity;
								}
							}
							for(var i=0;i<outputs.length;i++){
								if(outputs[i].date > new Date(to.getTime() + (24*60*60*1000))){
									closingStock += outputs[i].quantity;
								}
							}
							var check = from;
							openingStock = closingStock;
							for(var j=0;check >= from && check <= to;j++){
								for(var i=0;i<inputs.length;i++){
									if(inputs[i].date.getDate() === check.getDate() && inputs[i].date.getMonth() === check.getMonth() && inputs[i].date.getFullYear() === check.getFullYear()){
										input_output.push(inputs[i]);
										openingStock -= inputs[i].quantity;
									}
								}
								for(var i=0;i<outputs.length;i++){
									if(outputs[i].date.getDate() === check.getDate() && outputs[i].date.getMonth() === check.getMonth() && outputs[i].date.getFullYear() === check.getFullYear()){
										input_output.push(outputs[i]);
										openingStock += outputs[i].quantity;
									}
								}
								check = new Date(check.getTime() + (24*60*60*1000));
							}
							res.render("reports_with_data",{input_output:input_output,raw_material:raw_material,openingStock:openingStock,closingStock:closingStock,from:req.body.from,to:req.body.to,total_in:0,total_out:0});
						}
					});
				}
			});
		}
	});
});

app.get("/report/PO",function(req,res){
	var q = "SELECT * FROM PO";
	con.query(q,function(err,PO){
		if(err)
			res.render("error");
		else {
			res.render("report_by_PO",{PO:PO});
		}
	});
});

app.post("/report/PO",function(req,res){
	var q = 'SELECT p.*,i.sum FROM PO_detail AS p LEFT OUTER JOIN (SELECT SUM(quantity) AS sum,PO_code,raw_desc FROM input WHERE PO_code = "' + req.body.PO.code + '" GROUP BY raw_desc) AS i ON p.PO_code = i.PO_code AND p.raw_desc = i.raw_desc WHERE p.PO_code = "' + req.body.PO.code + '"';
	con.query(q,function(err,PO){
		if(err)
			res.render("error");
		else
			res.render("report_with_data",{POs:PO});
	});
});

app.get("/report/PO/:code",function(req,res){
	var q = "SELECT * FROM input WHERE PO_code ='" + req.params.code + "'";
	con.query(q,function(err,inputs){
		if(err)
			res.render("error");
		else {
			res.render("report_by_PO_detail",{PO_code:req.params.code,inputs:inputs});
		}
	});
});

app.get("/report/input",function(req,res){
	res.render("report_date",{type:"input"});
});

app.get("/report/output",function(req,res){
	res.render("report_date",{type:"output"});
});

app.get("/report/shortage",function(req,res){
	var q = "SELECT * FROM raw_material WHERE stock<0.25*monthly_requirement ORDER BY code";
	var raw = [];
	con.query(q,function(err,raw){
		if(err)
			res.render("error");
		else {
			res.render("report_more_less",{raw_materials:raw,type:"shortage"});
		}
	});
});

app.get("/report/excess",function(req,res){
	var q = "SELECT * FROM raw_material WHERE stock>monthly_requirement ORDER BY code";
	var raw = [];
	con.query(q,function(err,raw){
		if(err)
			res.render("error");
		else {
			res.render("report_more_less",{raw_materials:raw,type:"excess"});
		}
	});
});

app.post("/report/:type",function(req,res){
	var Dateto = req.body.to.split("-"), Datefrom = req.body.from.split("-");
	var to = new Date(Dateto[0],parseInt(Dateto[1])-1,parseInt(Dateto[2])+1);
	var from = new Date(Datefrom[0],parseInt(Datefrom[1])-1,parseInt(Datefrom[2]));
	var i_o = [];
	var q;
	if(req.params.type === "input")
		q = "SELECT i.*,r.code FROM input AS i INNER JOIN raw_material AS r ON r.name = i.raw_desc ORDER BY date DESC";
	else
		q = "SELECT * FROM output ORDER BY date DESC"
	con.query(q,function(err,i_os){
		if(err)
			throw err;
		else {
			for(var i=0;i<i_os.length;i++){
				if(i_os[i].date >= from && i_os[i].date <= to)
					i_o.push(i_os[i]);
			}
			from.setDate(from.getDate()+1);
			i_o.reverse();
			res.render("report_inputORoutput",{i_o:i_o,type:req.params.type,to:to,from:from});
		}
	});
});

module.exports = app;
