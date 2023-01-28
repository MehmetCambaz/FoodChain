const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jsonwebtoken = require("jsonwebtoken");

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

const BlockChain = require('./BlockChain.js')
const Block = require('./Block.js')


app.set('view engine', 'pug');
app.set('views', 'views');

mongoose.connect('mongodb://localhost/login_system', {
	useNewUrlParser: true
});
const User = mongoose.model('User', {
	username: String,
	password: String
});

const checkToken = (request, response, next)  => {
	const token =request.cookies.token;

    try{
		const user = jsonwebtoken.verify(token, JWT_SECRET);
		request.user = user;
		

		if(request.user.user === 'admin'){
			next();
		}
		else{
			res.sendStatus(403)
		}
			

		console.log(request.user);
		console.log(request.user.user);
		console.log(user);

	}catch (err){
		console.log(request.user);
		response.redirect('/login');
	}
}



blockChain = new BlockChain();


app.get('/', checkToken, function (request, response, next) {

	//response.sendFile(path.join(__dirname, 'views', 'Operations.html'));



	response.render('opetations', {
		"blockChain": blockChain.blockchain,
		"data": blockChain.blockchain.data,
		"username" : 'Cambaz',
		"role": 'Admin'
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
	console.log(jsonobj);

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
		
		const token = jsonwebtoken.sign({ user: "admin" }, JWT_SECRET, { expiresIn: "1h"});

		res.cookie("token", token, {
			httpOnly : false,
			secure: false,
		});

		res.redirect('/');
	} else {
		res.send('Invalid login');
	}
});




app.listen(3000);