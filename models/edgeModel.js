const mongoose = require('mongoose');

const edgeSchema = new mongoose.Schema({
    node_a_id: {
        required: true,
        type: String,
    },
    node_b_id: {
        required: true,
        type: String,
    },
    distance: {
        required: true,
        type: Number,
    },
});

module.exports = new mongoose.model("Edge", edgeSchema);