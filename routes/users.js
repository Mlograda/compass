const express = require('express');
const router = express.Router();

const passport = require('passport')
const catchAsync = require("../utilities/catchAsync");

const users = require('../controllers/users')
const multer = require('multer');
const { UserStorage } = require('../cloudinary');
const upload = multer({ storage: UserStorage });

const { validateUser, validatePassword, isLoggedIn } = require('../middleware');




/*GET- REGISTER USER*/
router.get('/register', catchAsync(users.getRegisterUser))
/*POST- REGISTER USER*/
router.post('/register', validateUser, catchAsync(users.postRegisteredUSer))

/*GET- LOGIN USER*/
router.get('/login', users.getLoginUser)
/*POST- LOGIN USER*/
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.postLoginUser)

/*GET- LOG OUT USER*/
router.get('/logout', users.getLogout)

/*GET- RESET USER PASSWORD*/
router.get('/reset', users.getReset)
/*POST- RESET USER PASSWORD*/
router.post('/reset', catchAsync(users.postReset))
/*GET- RESET USER PASSWORD WITH TOKEN IN QUERY*/
router.get('/reset/:token', catchAsync(users.getNewPasswordForm))
/*POST- UPDATE NEW USER PASSWORD*/
router.post('/new-password', validatePassword, catchAsync(users.postNewPassword))

/*GET- USER PROFILE PAGE*/
router.get('/profile/:id', isLoggedIn, catchAsync(users.getUserProfile))
/*GET- UPDATE USER PROFILE PAGE*/
router.patch('/profile/:id', catchAsync(users.editUserProfile))


module.exports = router