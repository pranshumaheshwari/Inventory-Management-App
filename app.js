//=========================================
//              INITIALISE
//=========================================

var express 	   = require('express'),
	mysql 	  	   = require('mysql'),
	bodyParser 	   = require('body-parser'),
	methodOverride = require('method-override'),
	// morgan		   = require('morgan'),
	logger    	   = require('./config/winston'),
	app 		   = express(),
	http 		   = require('http').Server(app),
	io 			   = require('socket.io')(http);

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
// app.use(morgan('combined',{ 'stream': winston.stream }));
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

//----------------------------------------
//         		 SOCKET
//----------------------------------------

io.on('connection', async function(socket){
  socket.on('slip_no', async function(val){
  	var q = "SELECT COUNT(*) AS c FROM output WHERE slip_no = '" + val + "'";
  	await con.query(q,async function(err,count){
  		if(err)
  			throw err;
  		else{
  			if(count[0].c > 0){
  				socket.emit('return_slip',true);
  			} else {
  				socket.emit('return_slip',false);
  			}
  		}
  	});
  });
});

//======================================
//                ROOT
//======================================

app.get("/",function(req,res){
	res.render("landing");
});

app.get("/temp",function(req,res){
   var q = "SELECT r.code,r.name,r.stock,i.qu,o.q FROM raw_material AS r LEFT OUTER JOIN (SELECT SUM(quantity) AS qu,raw_desc FROM input WHERE date>='2018-09-01' GROUP BY raw_desc) AS i ON i.raw_desc = r.name LEFT OUTER JOIN (SELECT SUM(quantity) AS q,raw_material_code AS w FROM output WHERE date>='2018-09-01' GROUP BY w) AS o ON o.w = r.code ORDER BY r.code";
   con.query(q,function(err,raw_materials){
    if(err)
      throw err;
    else
      res.render("temp",{raw_materials:raw_materials});
   });
});
//=======================================
//              OTHERS
//=======================================

app.get("*",function(req,res){
	res.send("Oops you went on the wrong page!!!!");
});

//=======================================
http.listen(3000,function(){
	console.log("Server has started at PORT 3000");
});