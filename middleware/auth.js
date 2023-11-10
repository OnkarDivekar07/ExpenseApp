const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const user = jwt.verify(token, process.env.secretKey);

        // Set userId property in the request
        req.userId = user;

        // Continue with the next middleware
        next();
    } catch (err) {
        res.status(400).json({ success: false, message: 'Invalid token' });
    }
};
