const jwt = require('jsonwebtoken');
const { StatusCodes, getReasonPhrase } = require('http-status-codes');

const checkAdmin = (req, res, next) => {
    const decryptedToken = jwt.verify(req.headers.authorization.split(" ")[1], process.env.JWT_SECRET_KEY);
    if (decryptedToken.email === process.env.ADMIN_EMAIL) {
        next();
    } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ "message": getReasonPhrase(StatusCodes.UNAUTHORIZED) });
    }
}

module.exports = { checkAdmin };