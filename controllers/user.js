const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const errorResponse = require('../utils/errorResponse');

//@desc Get all the users
//@route GET /api/v1/users
//@access private/admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    res.status(200).send(res.advanceResult);
});

//@desc Get single user details
//@route GET /api/v1/users/:id
//@access private/admin
exports.getUser = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new errorResponse('User not found!', 404));
    }
    res.status(200).send({
        success: true,
        data: user
    });
});

//@desc Create single user
//@route POST /api/v1/users
//@access private/admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);
    if (!user) {
        return next(new errorResponse('User not added!', 400));
    }
    res.status(200).send({
        success: true,
        data: user
    });
});


//@desc Update single user
//@route PUT /api/v1/users/:id
//@access private/admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!user) {
        return next(new errorResponse('User not found!', 404));
    }
    res.status(200).send({
        success: true,
        data: user
    });
});

//@desc Delete single user
//@route DELETE /api/v1/users/:id
//@access private/admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new errorResponse('User not found!', 404));
    }
    await user.remove();
    res.status(200).send({
        success: true,
    });
});