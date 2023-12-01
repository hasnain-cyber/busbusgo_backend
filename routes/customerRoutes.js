const express = require("express");
const router = express.Router();
const bookingModel = require('../models/bookingModel');
const { StatusCodes, getReasonPhrase } = require('http-status-codes');

const jwt = require('jsonwebtoken');

router.get('/getBookings', async (req, res) => {
    const decryptedToken = jwt.verify(req.headers.authorization.split(" ")[1], process.env.JWT_SECRET_KEY);

    try {
        // get all bookings with current customer id
        const bookings = await bookingModel.find({ customer_id: decryptedToken.used_id });
        res.status(StatusCodes.OK).json({ bookings });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "message": getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
});

module.exports = router;