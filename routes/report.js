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
			res.render("error");
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
					res.render("error");
				else {
					q = "SELECT * FROM output WHERE raw_material_code ='" + raw_material.code + "' ORDER BY date";
					con.query(q,function(err,outputs){
						if(err)
							res.render("error");
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
	var q = "SELECT * FROM PO WHERE code ='" + req.body.PO.code + "'";
	con.query(q,function(err,PO){
		if(err)
			res.render("error");
		else {
			q = "SELECT * FROM PO_detail WHERE PO_code ='" + req.body.PO.code + "'";
			con.query(q,function(err,POs){
				if(err)
					throw err;
				q = "SELECT * FROM supplier WHERE code ='" + PO[0].supplier_code + "'";
				con.query(q,function(err,supplier){
					if(err)
						throw err;
					res.render("report_with_data",{POs:POs,PO:PO[0],supplier:supplier[0]});
				});
			});
		}
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
	var q = "SELECT * FROM raw_material WHERE (stock+line_stock)<0.25*monthly_requirement ORDER BY code";
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
	var q = "SELECT * FROM raw_material WHERE (stock+line_stock)>monthly_requirement ORDER BY code";
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
	var q = "SELECT * FROM " + req.params.type + " ORDER BY date DESC";
	con.query(q,function(err,i_os){
		if(err)
			res.render("error");
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