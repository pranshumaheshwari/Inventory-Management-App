var express 	   = require('express'),
	mysql 	  	   = require('mysql'),
	bodyParser 	   = require('body-parser'),
	methodOverride = require('method-override'),
	app      	   = express.Router();

var con = mysql.createConnection({
		host: "localhost",
  	user: "root",
  	password: "Pranshu@511",
  	database: "Store"
});

app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));

app.get("/inventory",function(req,res){
	var q = "SELECT * FROM raw_material ORDER BY code";
	con.query(q,function(err,raw_materials){
		if(err){
			throw err;
		} else {
			res.render("inventory",{raw_materials:raw_materials,totalPrice:0,stock:0});
		}
	});
});

app.get("/inventory/new",function(req,res){
	var q = "SELECT code FROM supplier ORDER BY name";
		con.query(q,function(err,supplier_code){
			if(err)
				res.render("error");
		res.render("new_raw_material",{supplier_code:supplier_code});
	});
});

app.get("/inventory/:code",function(req,res){
	var code = req.params.code;
	var q = 'SELECT * FROM raw_material WHERE code = "' + code + '"';
	con.query(q,function(err,raw_material){
		if(err){
			res.render("error");
		} else {
			q = "SELECT code FROM supplier ORDER BY name";
			con.query(q,function(err,supplier_code){
				if(err)
					res.render("error");
				res.render("update_delete_raw_material",{raw_material:raw_material[0],supplier_code:supplier_code});
			});
		}
	});
});

app.get("/inventory/:code/requirement",function(req,res){
	var q = "SELECT * FROM finished_goods_detail WHERE raw_material_code ='" + req.params.code + "'";
	con.query(q,function(err,finished_goods){
		if(err)
			res.render("error");
		else
			res.render("raw_material_requirement",{finished_goods:finished_goods,raw:req.params.code});
	});
});

app.post("/inventory/search/category",function(req,res){
	var q = "SELECT * FROM raw_material WHERE category = '" + req.body.category + "' ORDER BY code";
	con.query(q,function(err,raw_materials){
		if(err)
			res.render("error");
		else {
			res.render("inventory",{raw_materials:raw_materials,totalPrice:0});
		}
	});
});

app.post("/inventory/search/name",function(req,res){
	var code = req.body.name_code.split(",")[1];
	var q = "SELECT * FROM raw_material WHERE code = '" + code + "'";
	con.query(q,function(err,raw_material){
		if(err)
			res.render("error");
		else {
			res.render("inventory",{raw_materials:raw_material,totalPrice:0});
		}
	});
});

app.post("/inventory/new",function(req,res){
	var raw_material = req.body.raw_material,
		q = "INSERT INTO raw_material SET ?";

	con.query(q,raw_material,function(err){
		if(err){
			res.render("error");

		} else {
			res.redirect("/inventory");
		}
	});
});

app.post("/inventory/:code/update",function(req,res){
	var q = 'UPDATE raw_material SET ? WHERE code = "' + req.params.code + '"';
	con.query(q,req.body.raw_material,function(err){
		if(err){
			res.render("error");
		} else {
			res.redirect("/inventory");
		}
	});
});

app.post("/inventory/:code/delete",function(req,res){
	var q = 'DELETE FROM raw_material WHERE code = "' + req.params.code + '"';
	con.query(q,function(err){
		if(err){
			res.render("error");
		} else {
			res.redirect("/inventory");
		}
	});
});

module.exports = app;
