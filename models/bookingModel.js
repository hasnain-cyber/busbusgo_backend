const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bus_id: {
        required: true,
        type: String,
    },
    seat_id: {
        required: true,
        type: String,
    },
    customer_id: {
        required: true,
        type: String,
    },
    start_node_id: {
        required: true,
        type: String,
    },
    end_node_id: {
        required: true,
        type: String,
    },
    cost: {
        required: true,
        type: Number,
    },
    // 0 for not paid, 1 for paid and booked, 2 for cancelled
    status: {
        required: true,
        type: Number,
    }
});

module.exports = new mongoose.model("Booking", bookingSchema);