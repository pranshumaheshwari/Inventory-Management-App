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

app.get("/output",function(req,res){
	var q = "SELECT * FROM raw_material";
	con.query(q,function(err,raw_materials){
		if(err)
			res.render("error");
		else {
				res.render("output",{raw_materials:raw_materials});
		}
	});
});

app.post("/output",function(req,res){
	var product_code = req.body.product_code;
	var slip_no = req.body.slip_no[0];
	var quantity = req.body.Quantity;
	var output = [], initialStock = [];
	for(var i=0;i<quantity.length;i++){
		output.push({
			slip_no: slip_no,
			raw_material_code: product_code[i],
			quantity: quantity[i]
		});
		var q = "INSERT INTO output SET ?";
		con.query(q,output[i],function(err){
			if(err)
				res.render("error");
		});
		q = "SELECT * FROM raw_material WHERE code = '" + output[i].raw_material_code + "'";
		con.query(q,function(err,raw_material){
			if(err)
				res.render("error");
			else {
				if(i === quantity.length)
					i = 0;
				var finalStock = raw_material[0].stock - output[i].quantity;
				var line_stock = parseFloat(raw_material[0].line_stock) + parseFloat(output[i].quantity);
				var q = "UPDATE raw_material SET stock = " + finalStock + ",line_stock = " + line_stock + " WHERE code = '" + output[i].raw_material_code + "'";
				con.query(q,function(err){
					if(err)
						res.render("error");
				});
				i++;
			}
		});
	}
	res.redirect("/output");
});

module.exports = app;