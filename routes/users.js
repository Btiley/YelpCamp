const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
// This middle ware stores return to URL once we go to login page
const {storeReturnTo} = require('../middleware');

router.route('/register')
    // Renders registration form
    .get(users.renderRegistrationForm)
    // Registers user
    .post(storeReturnTo,users.registerUser)

router.route('/login')
    // Renders Login Form
    .get(users.renderLoginForm)
    // Logs user in, and redirects if redirect address is found.
    .post(storeReturnTo,passport.authenticate('local', {failureFlash:true, failureRedirect: '/login'}), users.userLogin)

// Logging out (removing user cookie)
// Logs out
router.get('/logout', users.userLogOut)

module.exports = router;