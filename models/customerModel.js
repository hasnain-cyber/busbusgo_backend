const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
    email: {
        required: true,
        type: String,
    },
    password: {
        required: true,
        type: String,
    },
    booking_id: {
        type: String,
        default: null,
    },
});

module.exports = new mongoose.model("Customers", customerSchema);