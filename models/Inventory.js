
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/login_system', {
	useNewUrlParser: true
});
const Inventory = mongoose.model('Inventory', {
	product_id: String,
    user_id: String,
	username: String,
    insert_date: Date,
    product_name: String,
    product_brand: String,
    production_date: Date,
    approval_date: Date,
    approval_status: Number
});

module.exports = Inventory;