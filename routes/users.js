const express = require('express')
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync')
const passport = require('passport')
const {storeReturnTo} = require('../middleware')
const users = require('../controllers/users')
 
router.route('/register')
.get(users.newUserForm)
.post(wrapAsync(users.postNewUser))

router.route('/login')
.get(users.loginForm)
.post(storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.postLoginForm)
// local refers to the user credentials in the database

router.get('/logout', users.logout)

module.exports = router