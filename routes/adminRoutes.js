const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodeModel = require('../models/nodeModel');
const edgeModel = require('../models/edgeModel');
const busModel = require('../models/busModel');
const { StatusCodes, getReasonPhrase } = require('http-status-codes');
const { checkAdmin } = require("../middlewares");

const generateJWTToken = (used_id, name, email, password) => {
    return jwt.sign({ used_id, name, email, password }, process.env.JWT_SECRET_KEY);
}

router.post('/addNode', [checkAdmin], async (req, res) => {
    // create a node and send it as response
    try {
        const node = await nodeModel.create({});
        res.status(StatusCodes.CREATED).json({ node });
    } catch(err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "message": getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
});

router.post('/addEdge', [checkAdmin], async (req, res) => {
    if (!req.body.node_a_id || !req.body.node_b_id || !req.body.weight) {
        res.status(StatusCodes.BAD_REQUEST).json({ "message": getReasonPhrase(StatusCodes.BAD_REQUEST) });
        return;
    }

    // create a node and send it as response
    try {
        const edge = await edgeModel.create({
            node_a_id: req.body.node_a_id,
            node_b_id: req.body.node_b_id,
            weight: req.body.weight,
        });
        res.status(StatusCodes.CREATED).json({ edge });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "message": getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
});

router.post('/addBus', [checkAdmin], async (req, res) => {
    console.log(req.body)
    if (!req.body.capacity || !req.body.days_of_operation || !req.body.route) {
        res.status(StatusCodes.BAD_REQUEST).json({ "message": getReasonPhrase(StatusCodes.BAD_REQUEST) });
        return;
    }

    try {
        const bus = await busModel.create({
            capacity: Number(req.body.capacity),
            occupied_seats: Array(Number(req.body.capacity)).fill(false),
            days_of_operation: Number(req.body.days_of_operation),
            route: req.body.route.split(' '),
        });
        res.status(StatusCodes.CREATED).json({ bus });
    } catch (err) {
        console.log("🚀 ~ file: adminRoutes.js:67 ~ router.post ~ err:", err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "message": getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
});

module.exports = router;