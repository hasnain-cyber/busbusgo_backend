const mongoose = require('mongoose');
const nodeModel = require('./nodeModel');

const busSchema = new mongoose.Schema({
    capacity: {
        required: true,
        type: Number,
    },
    occupied_seats: {
        required: true,
        type: Number,
    },
    days_of_operation: {
        required: true,
        type: Number,
    },
    route: [{
        type: nodeModel.schema,
        default: null,
    }],
    current_location: {
        type: String,
        default: null,
    }
});

module.exports = new mongoose.model("Bus", busSchema);