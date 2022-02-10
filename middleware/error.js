const ErrorResponse = require('../utils/errorResponse');
const errorHandle = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    console.log(err);

    // mongoose bad objectId/ objectid not found
    if (err.name === 'CastError') {
        const message = `Resource not found!`;
        error = new ErrorResponse(message, 404);
    }

    //dublicate value error
    if (err.code === 11000) {
        const message = 'Dublicate value cannot be accepted!';
        error = new ErrorResponse(message, 400);
    }

    //validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 422);
    }

    res.status(error.statusCode || 500).send({
        success: false,
        error: error.message || 'Server error'
    });
}
module.exports = errorHandle;