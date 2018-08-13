//=========================================
//              INITIALISE
//=========================================

var express 	   = require('express'),
	mysql 	  	   = require('mysql'),
	bodyParser 	   = require('body-parser'),
	methodOverride = require('method-override'),
	app 		   = express();

var inventoryRoutes 	= require('./routes/inventory'),
	supplierRoutes  	= require('./routes/supplier'),
	PORoutes			= require('./routes/PO'),
	inputRoutes			= require('./routes/input'),
	outputRoutes		= require('./routes/output'),
	reportRoutes		= require('./routes/report'),
	finishedGoodRoutes  = require('./routes/finishedGood');

app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(methodOverride("_method"));
app.use(express.static( __dirname + "/public"));
app.use(inventoryRoutes);
app.use(supplierRoutes);
app.use(PORoutes);
app.use(inputRoutes);
app.use(outputRoutes);
app.use(reportRoutes);
app.use(finishedGoodRoutes);
app.set("view engine","ejs");

var con = mysql.createConnection({
	host: "localhost",
  	user: "root",
  	password: "",
  	database: "Store"
});

//======================================
//                ROOT
//======================================

app.get("/",function(req,res){
	res.render("landing");
});

//=======================================
//              OTHERS
//=======================================

app.get("*",function(req,res){
	res.send("Oops you went on the wrong page!!!!");
});

//=======================================
app.listen(3000,function(){
	console.log("Server has started at PORT 3000");
});