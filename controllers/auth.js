const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const errorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendMail');
const crypto = require('crypto');

//@desc Register new user
//@route POST /api/v1/auth/register
//@access public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const user = await User.create({
        name,
        password,
        email,
        role
    });
    if (!user) {
        return next(new errorResponse(`Could not register`, 400));
    }

    sendTokenResponse(user, 200, res);

});

//@desc Login user
//@route POST /api/v1/auth/login
//@access public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new errorResponse(`Email and password required`, 401));
    }

    const user = await User.findOne({ email: email }).select('+password');
    if (!user) {
        return next(new errorResponse(`Invalid Credentials`, 401));
    }

    //match user entered password to hasedpassword
    if (! await user.matchPassword(password)) {
        return next(new errorResponse(`Invalid Credentials`, 401));
    }

    sendTokenResponse(user, 200, res);
})

//@desc Log user out
//@route GET /api/v1/auth/logout
//@access private
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', '', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
    res.status(200).send({
        success: true,
        data: {},
        message: "Logged out successfully"
    })
});
//@desc Register new user
//@route POST /api/v1/auth/register
//@access private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    res.status(200).send({
        success: true,
        data: user
    })

});

//@desc update user details
//@route PUT /api/v1/auth/updatedetails
//@access private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    let updateFields = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
        new: true,
        runValidators: true,
    });
    res.status(200).send({
        success: true,
        data: user
    })

});

//@desc update user password
//@route PUT /api/v1/auth/updatepassword
//@access private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    console.log(user);
    //check current password match
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new errorResponse('Invaild current password'));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);

});

//@desc forgot password
//@route POST /api/v1/auth/forgotpassword
//@access public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new errorResponse(`Email ${req.body.email} doesnt exist! Please register.`, 404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });


    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const message = `This reset password request has been sent from you! if its not you please ignore this message
                        click here  ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Reset Password',
            message
        })
        res.status(200).send({
            success: true,
            data: "Email sent",
        })
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new errorResponse('Could not sent email! Please try agian.', 500));
    }
})


exports.resetPassword = asyncHandler(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now()
        }
    });

    if (!user) {
        return next(new errorResponse(`Reset link expired or invaild.`, 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
})

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .send({
            success: true,
            token
        });
}

