const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const customerModel = require('../models/customerModel');
const { StatusCodes, getReasonPhrase } = require('http-status-codes');
const { v4 } = require('uuid');

const generateJWTToken = (used_id, name, email, password) => {
    return jwt.sign({ used_id, name, email, password }, process.env.JWT_SECRET_KEY);
}

router.post('/register', async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        res.status(StatusCodes.BAD_REQUEST).json({ "message": getReasonPhrase(StatusCodes.BAD_REQUEST) });
        return;
    }

    try {
        const query = await customerModel.findOne({ email: req.body.email });
        if (!query) {
            const user = await customerModel.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
            });
            const token = generateJWTToken(v4(), req.body.name, req.body.email, false, '0', Date());
            res.status(StatusCodes.CREATED).json({ user, token });
        } else {
            res.status(StatusCodes.BAD_REQUEST).json({ "message": getReasonPhrase(StatusCodes.BAD_REQUEST) });
        }
    } catch (err) {
        console.log("🚀 ~ file: authRoutes.js:31 ~ router.post ~ err:", err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "message": getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) });
    }
});

router.get('/login', async (req, res) => {
    const credentials = req.headers.authorization;
    const email = credentials.split(':')[0];
    const password = credentials.split(':')[1];

    try {
        const query = await customerModel.findOne({ email, password });
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