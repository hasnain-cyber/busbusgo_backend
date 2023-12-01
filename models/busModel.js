const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    capacity: {
        required: true,
        type: Number,
    },
    occupied_seats: [{
        required: true,
        type: Boolean,
    }],
    days_of_operation: {
        required: true,
        type: Number,
    },
    route: [{
        type: String,
        default: null,
    }],
    current_location: {
        type: String,
        default: null,
    }
});

module.exports = new mongoose.model("Bus", busSchema);