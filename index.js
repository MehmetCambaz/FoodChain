const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const jsonwebtoken = require("jsonwebtoken");
const {ObjectId} = require('mongodb');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// The secret should be an unguessable long string (you can use a password generator for this!)
const JWT_SECRET = "test";


app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(express.urlencoded({
	extended: false
}))

app.use(function(req,res,next){
	if (req.user) {
		req.session.role = request.user.role;
	}
	next();
});

const BlockChain = require('./BlockChain.js')
const Block = require('./Block.js')
const db = require('./database.js');

var User = require('./models/User');
var Inventory = require('./models/Inventory');

app.set('view engine', 'pug');
app.set('views', 'views');



const checkToken = (request, response, next) => {
	const token = request.cookies.token;

	try {
		const user = jsonwebtoken.verify(token, JWT_SECRET);
		request.user = user;


		if (request.user.user === 'admin') {
			next();
		} else {
			res.sendStatus(403)
		}

	} catch (err) {
		console.log(request.user);
		response.redirect('/login');
	}
}

const isUserAdmin = (request, response, next) => {
	const token = request.cookies.token;
	var user_role;

	try {
		const user = jsonwebtoken.verify(token, JWT_SECRET);
		request.user = user;

		user_role = request.user.role;

		if(user_role == "Admin")
			next();
		else
			response.sendStatus(401);

	} catch (err) {
		console.log("isUserAdmin_error");
		response.status(500).send('isUserAdmin_error!')
	}
}



blockChain = new BlockChain();


app.get('/', checkToken, function (request, response, next) {

	const token = request.cookies.token;
	var v_user_name, v_user_role;

	try {
		const user = jsonwebtoken.verify(token, JWT_SECRET);
		request.user = user;


		v_user_name =  request.user.username;
		v_user_role = request.user.role;

	} catch (err) {
		console.log("checkToken_error_inventory");
	}

	response.render('opetations', {
		"blockChain": blockChain.blockchain,
		"data": blockChain.blockchain.data,
		"username": v_user_name,
		"role": v_user_role
	});


});

app.post('/', checkToken, function (request, response, next) {

	let date = new Date();

	block = new Block(null, date, {
		name: request.body.product_name,
		brand: request.body.product_brand,
		date: request.body.production_date,
	});


	blockChain.addNewBlock(block);

	const jsonobj = JSON.stringify(blockChain, null, 5);
	//console.log(jsonobj);

	response.redirect('back');
});

app.get('/login', function (request, response, next) {

	response.render('login');

});

app.post('/login', async (req, res) => {
	const {
		username,
		password
	} = req.body;
	const user = await User.findOne({
		username,
		password
	});
	if (user) {
		//res.send('Successfully logged in');

		const token = jsonwebtoken.sign({
			user: "admin",
			username: user.username,
			user_id: user._id,
			role: user.role
		}, JWT_SECRET, {
			expiresIn: "1h"
		});

		res.cookie("token", token, {
			httpOnly: false,
			secure: false,
		});
		res.redirect('/');
	} else {
		res.send('Invalid login');
	}
});


app.post('/insert', checkToken, isUserAdmin, function (request, response, next) {
	console.log(request.body.product_id);
	let date = new Date();

	db.collection('inventories').updateOne({ '_id': ObjectId(request.body.product_id)},{$set: { approval_status: 1, approval_date: date }} , function (err, result) {});

	response.redirect('/insert');

});

app.get('/insert', checkToken, isUserAdmin, function (request, response, next) {
	const token = request.cookies.token;
	var v_user_name, v_user_role;

	try {
		const user = jsonwebtoken.verify(token, JWT_SECRET);
		request.user = user;


		v_user_name =  request.user.username;
		v_user_role = request.user.role;

	} catch (err) {
		console.log("checkToken_error_inventory");
	}

	Inventory.find({ approval_status: 0}).then((result) => response.render('insert', {"Inventory" : result, "username": v_user_name,
	"role": v_user_role}));
});

app.get('/inventory', checkToken, function (request, response, next) {

	const token = request.cookies.token;
	var v_user_name, v_user_role;

	try {
		const user = jsonwebtoken.verify(token, JWT_SECRET);
		request.user = user;


		v_user_name =  request.user.username;
		v_user_role = request.user.role;
	} catch (err) {
		console.log("checkToken_error_inventory");
	}

	Inventory.find({username: v_user_name}).then((result) => response.render('inventory', {"Inventory" : result, "username": v_user_name,
	"role": v_user_role}));
});

app.post('/inventory', checkToken, function (request, response) {

	const token = request.cookies.token;
	var user_name = "empty";

	try {
		const user = jsonwebtoken.verify(token, JWT_SECRET);
		request.user = user;


		user_name =  request.user.username;
		user_id = request.user.user_id;

	} catch (err) {
		console.log("checkToken_error");
	}

	var insert_data = {
		user_id: user_id,
		username: user_name,
		product_name: request.body.product_name,
		product_brand:	request.body.product_brand,
		production_date: request.body.production_date,
		approval_status: 0,
		product_weight: request.body.product_weight,
		insert_date: Date.now() 					
	}
	
	Inventory.insertMany(insert_data);

	response.redirect('back');
});


app.listen(3000);