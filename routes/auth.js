const express = require('express');
const { login, register, getMe, forgotPassword, resetPassword, updateDetails, updatePassword, logout } = require('../controllers/auth');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/register').post(register);
router.route('/me').get(auth, getMe);
router.route('/updatedetails').put(auth, updateDetails);
router.route('/updatepassword').put(auth, updatePassword);
router.route('/forgotpassword').post(forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
module.exports = router;