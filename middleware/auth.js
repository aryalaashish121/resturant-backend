const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.auth = asyncHandler(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization
        && req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    // else if (req.cookies.token) {
    //     token = req.cookies.token
    // }

    if (!token) {
        return next(new errorResponse('Unauthorized! Please login.', 401));
    }
    //verify token
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decode.id);
        if (!req.user) {
            return next(new errorResponse('Invaild Credentials.', 401));
        }
        next();
    } catch (error) {
        return next(new errorResponse('Unauthorized! Please login.', 401));
    }
})


exports.authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return next(new errorResponse(`User role ${req.user.role} is unauthoried for this action`, 403));
    }
    next();
}