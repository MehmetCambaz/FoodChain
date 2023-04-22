
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/login_system', {
	useNewUrlParser: true
});
const Inventory = mongoose.model('Inventory', {
    user_id: String,
	username: String,
    insert_date: Date,
    product_name: String,
    product_brand: String,
    product_weight: Number,
    production_date: Date,
    approval_date: Date,
    approval_status: Number
});

module.exports = Inventory;
