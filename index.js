const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const jsonwebtoken = require("jsonwebtoken");
const {ObjectId} = require('mongodb');
const CSVToJSON = require('csvtojson');
const multer  = require('multer')
const cookieParser = require('cookie-parser');
const fs = require('fs');

app.use(cookieParser());

var storage = multer.diskStorage(
    {
        destination: 'C:/Users/Cambaz-Monster/Documents/Projects/FoodChain/FoodChain/LabResultFiles/',
        filename: function ( req, file, cb ) {
            //req.body is empty...
            //How could I get the new_file_name property sent from client here?
            cb( null, file.originalname);
        }
    }
);

var upload = multer( { storage: storage } );


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
	let productID = request.body.product_id;
	let date = new Date();
  
	db.collection('inventories').findOneAndUpdate(
	  { '_id': ObjectId(productID) },
	  { $set: { approval_status: 1, approval_date: date } },
	  { returnOriginal: false },
	  function (err, result) {
		if (err) {
		  console.log('insert_update_err:', err);
		  response.status(500).send('Error updating the document');
		  return;
		}
  
		if (!result.value) {
		  console.log('Document not found');
		  response.status(404).send('Document not found');
		  return;
		}
  
		if (result.modifiedCount === 0) {
		  console.log('Document not updated');
		  response.status(400).send('Document not updated');
		  return;
		}
  
		//console.log('Updated document:', result.value.product_brand);

		block = new Block(
			null, 
			result.value.production_date, {
			name: result.value.product_name,
			brand: result.value.product_brand,
			weight: result.value.product_weight,
			production_date: result.value.production_date,
			lab_results: result.value.product_lab_result
		});

		blockChain.addNewBlock(block);

		const jsonobj = JSON.stringify(blockChain, null, 5);
		console.log(jsonobj);
			
	  }
	);

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

	Inventory.find({ approval_status: 0}).sort({insert_date: -1}).then((result) => response.render('insert', {"Inventory" : result, "username": v_user_name,
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

	Inventory.find({username: v_user_name}).sort({insert_date: -1}).then((result) => response.render('inventory', {"Inventory" : result, "username": v_user_name,
	"role": v_user_role}));
});

app.post('/inventory', checkToken, upload.single('lab_result_file'), function (request, response, file) {

	const token = request.cookies.token;
	var user_name = "empty";
	var insert_data;
	//Create an instance of the form object

	try {
		const user = jsonwebtoken.verify(token, JWT_SECRET);
		request.user = user;


		user_name =  request.user.username;
		user_id = request.user.user_id;

	} catch (err) {
		console.log("checkToken_error");
	}

	// convert users.csv file to JSON array
	CSVToJSON().fromFile('C:/Users/Cambaz-Monster/Documents/Projects/FoodChain/FoodChain/LabResultFiles/TomatoLabResult.csv')
	.then(lab_results => {
		// users is a JSON array
		// log the JSON array
		insert_data = {
			user_id: user_id,
			username: user_name,
			product_name: request.body.product_name,
			product_brand:	request.body.product_brand,
			production_date: request.body.production_date,
			approval_status: 0,
			product_lab_result: JSON.stringify(lab_results),
			product_weight: request.body.product_weight,
			insert_date: Date.now() 					
		}

		Inventory.insertMany(insert_data);

		fs.renameSync('C:/Users/Cambaz-Monster/Documents/Projects/FoodChain/FoodChain/LabResultFiles/TomatoLabResult.csv',
		 'C:/Users/Cambaz-Monster/Documents/Projects/FoodChain/FoodChain/LabResultFiles/TomatoLabResult' + Date.now() + '.csv');
		}).catch(err => {
		// log error if any
		console.log(err);
	});

	
	
	

	console.log(request.body);

	response.redirect('back');
});


app.listen(3000);