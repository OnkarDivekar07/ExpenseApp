const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const user = jwt.verify(token, process.env.secretKey);

        req.userId = user;
        next();
    } catch (err) {
        res.status(400).json({ success: false, message: 'Invalid token' });
    }
};
