
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/login_system', {
	useNewUrlParser: true
});
const Inventory = mongoose.model('Inventory', {
    _id: String,
    user_id: String,
	username: String,
    insert_date: Date,
    product_name: String,
    product_brand: String,
    product_weight: Number,
    production_date: Date,
    product_lab_result: String,
    approval_date: Date,
    approval_status: Number
});

module.exports = Inventory;
