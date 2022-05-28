//=========================================
//              INITIALISE
//=========================================

var express 	   				 		 = require('express'),
	bodyParser 	  						 = require('body-parser'),
	methodOverride 						 = require('method-override'),
	cookieParser 						 = require('cookie-parser')
	logger    	 						 = require('./config/winston'),
	app 		  						 = express(),
	http 		   						 = require('http').Server(app),
	io 			   						 = require('socket.io')(http),
	logger		  	 					 = require('./config/winston').finished_good,
	{ selectQuery } 		 			 = require('./config/query.js');

var inventoryRoutes 	= require('./routes/inventory'),
	supplierRoutes  	= require('./routes/supplier'),
	PORoutes			= require('./routes/PO'),
	inputRoutes			= require('./routes/input'),
	outputRoutes		= require('./routes/output'),
	reportRoutes		= require('./routes/report'),
	finishedGoodRoutes  = require('./routes/finishedGood');

app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(express.static( __dirname + "/public"));
app.use((req, res, next) => {
	if (req.method === 'POST' && req.url === '/')
		next()
	else {
		if (req.cookies.user) {
			next()
		} else {
			res.render("login", {err: ``});
		}
	}
});
app.use(inventoryRoutes);
app.use(supplierRoutes);
app.use(PORoutes);
app.use(inputRoutes);
app.use(outputRoutes);
app.use(reportRoutes);
app.use(finishedGoodRoutes);
app.set("view engine","ejs");

//----------------------------------------
//         		 SOCKET
//----------------------------------------

io.on('connection', async function(socket){

  socket.on('slip_no', async function(val){
  	var q = "SELECT COUNT(*) AS c FROM output WHERE slip_no = '" + val + "'";
		await selectQuery(q)
									.then(count => {
										if(count[0].c > 0){
						  				socket.emit('return_slip',true);
						  			} else {
						  				socket.emit('return_slip',false);
						  			}
									})
									.catch(err => {
										logger.error({
												error: err,
												where: `slip_no socket`,
												time: Date.now().toString()
										});
									});
  });

	socket.on('check-stock', async function(val){
  	var q = "SELECT stock FROM raw_material WHERE name = '" + val + "'";
		await selectQuery(q)
									.then(stock => {
										socket.emit("return-check-stock",stock[0].stock);
									})
									.catch(err => {
										logger.error({
												error: err,
												where: `check-stock socket`,
												time: Date.now().toString()
										});
									});
  });

	socket.on('getRemaingQuantity', async (val) => {
		var q = `SELECT SUM(quantity) AS sum FROM input WHERE PO_code = '${ val.PO_code }' AND raw_desc = '${ val.name }'`;
		await selectQuery(q)
						.then(async quantity => {
							q = `SELECT initial_quantity FROM PO_detail WHERE PO_code = '${ val.PO_code }' AND raw_desc = '${ val.name }'`;
							await selectQuery(q)
									.then(async initial_quantity => {
										q = `SELECT price FROM raw_material WHERE name = '${ val.name }'`;
										await selectQuery(q)
														.then(price => {
															socket.emit("return-Price", price[0].price);
														})
														.catch(err => {
															logger.error({
																	error: err,
																	where: `getRemaingQuantity socket`,
																	time: Date.now().toString()
															});
									});
										socket.emit("return-getRemaingQuantity", initial_quantity[0].initial_quantity - quantity[0].sum);
									})
									.catch(err => {
										logger.error({
												error: err,
												where: `return-getRemaingQuantity socket`,
												time: Date.now().toString()
										});
									});
						})
						.catch(err => {
							logger.error({
									error: err,
									where: `getRemaingQuantity socket`,
									time: Date.now().toString()
							});
						});
	});
});

//======================================
//                ROOT
//======================================

app.get("/",function(req, res) {
	if(req.cookies.user){
		res.render('landing')
	} else {
		res.render("login", {err: ``});
	}
	// res.render("invoice");
});

app.post("/", async (req, res) => {
	var q = `SELECT * FROM users WHERE username = '${req.body.username}'`
	selectQuery(q)
		.then(users => {
			let user = users[0];
			if(user && req.body.password === user.password) {
				// if(user.isAdmin) {
					res.cookie('user', user.type, {
						maxAge: 1000 * 60 * 60 * 12
					})
				// } else {
				// 	res.cookie('isAdmin', false, {
				// 		maxAge: 1000 * 60 * 60 * 12
				// 	})
				// }
				res.render('landing')
			} else {
				res.render('login', {err: `User Not Found`})
			}
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

app.get('/logout', async (req, res) => {
	res.clearCookie("isAdmin");
	res.render("login", {err: ``});
});

//=======================================
//              OTHERS
//=======================================

app.get("*",function(req,res){
	res.send("Oops you went on the wrong page!!!!");
});

//=======================================

http.listen(20865,function(){
	console.log("Server has started at PORT 3000");
});
