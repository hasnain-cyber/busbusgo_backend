const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const adminModel = require('../models/adminModel');
const { StatusCodes, getReasonPhrase } = require('http-status-codes');

const generateJWTToken = (used_id, name, email, password) => {
    return jwt.sign({ used_id, name, email, password }, process.env.JWT_SECRET_KEY);
}

router.post('/login', async (req, res) => {
    const credentials = req.headers.authorization.split(' ')[1];
    const email = credentials.split(':')[0];
    const password = credentials.split(':')[1];

    try {
        const query = await adminModel.findOne({ email, password });
        if (query) {
            const token = generateJWTToken(query._id, query.name, query.email, query.password);
            res.status(StatusCodes.OK).send({ user: query, token });
        } else {
            res.status(StatusCodes.UNAUTHORIZED).json({ "message": getReasonPhrase(StatusCodes.UNAUTHORIZED) });
        }
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "message": getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
});

module.exports = router;