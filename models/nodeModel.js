const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
});

module.exports = new mongoose.model("Node", nodeSchema);