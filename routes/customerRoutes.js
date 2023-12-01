const express = require("express");
const router = express.Router();
const nodeModel = require('../models/nodeModel');
const bookingModel = require('../models/bookingModel');
const { StatusCodes, getReasonPhrase } = require('http-status-codes');
const { checkAdmin } = require("../middlewares");

router.post('/getBookings', [checkAdmin], async (req, res) => {
    if (!req.body.customer_id) {
        res.status(StatusCodes.BAD_REQUEST).json({ "message": getReasonPhrase(StatusCodes.BAD_REQUEST) });
        return;
    }

    // get all bookings with current customer id
    const bookings = await bookingModel.find({ customer_id: req.body.customer_id });
});

module.exports = router;