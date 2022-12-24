const express = require('express');
const path = require('path');
const app = express();
app.use(express.urlencoded({extended: false}))

const BlockChain = require('./BlockChain.js')
const Block = require('./Block.js')

const expressHbs = require('express-handlebars');

app.set('view engine', 'pug');
app.set('views', 'views');


blockChain = new BlockChain();


app.get('/', function(request, response, next){

	//response.sendFile(path.join(__dirname, 'views', 'Operations.html'));

	response.render('opetations', {"blockChain":blockChain.blockchain,"data":blockChain.blockchain.data});

});

app.post('/', function(request, response, next){

	let ts = Date.now();

	block =  new Block(null, ts, {
		name : request.body.product_name,
		brand: request.body.product_brand,
		date: request.body.production_date,
	});


    blockChain.addNewBlock(block);

	const jsonobj = JSON.stringify(blockChain, null, 5);
	console.log(jsonobj);

	response.redirect('back');
});

app.listen(3000);
