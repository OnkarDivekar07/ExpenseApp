const jwt = require('jsonwebtoken');
const secretKey = "8668442638@121021@24407#1722";
const userdetails = require('../model/userdetails');

exports.verifyToken = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const user = jwt.verify(token, "8668442638@121021@24407#1722");

        // Set userId property in the request
        req.userId = user;

        // Continue with the next middleware
        next();
    } catch (err) {
        res.status(400).json({ success: false, message: 'Invalid token' });
    }
};
