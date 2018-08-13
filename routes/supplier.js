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

app.get("/supplier",function(req,res){
	var q = "SELECT * FROM supplier ORDER BY name";
	con.query(q,function(err,suppliers){
		if(err){
			res.render("error");
		} else {
			res.render("supplier",{suppliers:suppliers});
		}
	});
});

app.get("/supplier/new",function(req,res){
	res.render("new_supplier");
});

app.get("/supplier/:code",function(req,res){
	var code = req.params.code;
	var q = 'SELECT * FROM supplier WHERE code = "' + code + '"';
	con.query(q,function(err,supplier){
		if(err){
			res.render("error");
		} else {
			res.render("update_delete_supplier",{supplier:supplier[0]});
		}
	});
});

app.post("/supplier/new",function(req,res){
	var supplier = req.body.supplier,
		q = "INSERT INTO supplier SET ?";
	con.query(q,supplier,function(err){
		if(err){
			res.render("error");
		} else {
			res.redirect("/supplier");
		}
	});
});

app.post("/supplier/:code/update",function(req,res){
	var q = 'UPDATE supplier SET ? WHERE code = "' + req.params.code + '"';
	con.query(q,req.body.supplier,function(err){
		if(err){
			res.render("error");
		} else {
			res.redirect("/supplier");
		}
	});
});

app.post("/supplier/:code/delete",function(req,res){
	var q = 'DELETE FROM supplier WHERE code = "' + req.params.code + '"';
	con.query(q,function(err){
		if(err){
			res.render("error");
		} else {
			res.redirect("/supplier");
		}
	});
});

module.exports = app;