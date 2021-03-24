const User = require('../models/user')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')

// TO BE ABLE TO SEND EMAILS 
// YOU MUST ADD IN YOUR SENDGRID API KEY 
// PROVIDED IN YOU SENDGRID ACCOUNT UNDER SETTINGS
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.NODEMAILER_KEY
    }
}))

/*GET - REGISTER USER*/
exports.getRegisterUser = async (req, res, next) => {
    res.render('users/register')
}

/*POST - REGISTER USER*/
exports.postRegisteredUSer = async (req, res, next) => {

    const { email, username, password } = req.body;
    const user = await User.findOne({ email: email })
    if (user) {
        req.flash('error', 'there is a user registered with this email please login or register with a diffrent email!')
        return res.redirect('/register')
    }
    try {

        const user = new User({ username: username, email: email })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, (err) => {
            if (err) return next(err)
            req.flash('success', 'You have successfully registered!')
            transporter.sendMail({
                to: email,
                // YOU NEED TO CREATE A VERIFIED SENDER IN YOUR SENDGRID ACCOUNT
                // WITH AN EXISTING ADDRESS EMAIL TO BE ABLE TO USE IT BELOW
                from: 'nozama.tr@gmail.com',
                subject: 'Sign Up Succeeded',
                html: '<h1> Congratulations, you successfuly signed up to Compass!<h1>'
            })
            res.redirect('/campgrounds')
        })

    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

/*GET - LOGIN USER*/
exports.getLoginUser = (req, res, next) => {

    if (!req.query.newcamp) {
        req.session.trackingUrl = req.get('referer')

    }
    res.render('users/login')
}

/*POST - LOGIN USER*/
exports.postLoginUser = (req, res) => {
    req.flash('success', 'welcome back!')
    const redirectUrl = req.session.trackingUrl || '/campgrounds';
    console.log('redirectULR', redirectUrl)
    delete req.session.trackingUrl
    res.redirect(redirectUrl)

}

/*GET - LOGOUT USER*/
exports.getLogout = (req, res, next) => {
    req.logOut()
    res.redirect('back')
}

/*GET - RESET USER PASSWORD*/
exports.getReset = (req, res, next) => {
    res.render('users/reset')
}

/*POST - RESET USER PASSWORD*/
exports.postReset = async (req, res, next) => {


    const token = await crypto.randomBytes(32).toString('hex')
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        req.flash('error', 'No such email exists!')
        return res.redirect('/login')
    }
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetURL = 'https://compass-ml.herokuapp.com' || 'http://localhost:3000/'
    req.flash('success', `An email, to reset your password, has been sent to ${req.body.email}, please check in!`)
    res.redirect('/login')
    transporter.sendMail({
        to: req.body.email,
        from: 'nozama.tr@gmail.com',
        subject: 'Password Reset',
        html: `<p>Please follow <a href="${resetURL}/reset/${token}">This link</a> to reset you password</p>
        <p>Please be aware that this link is valid one hour from reception time</p>`
    })

}

/*GET - NEW USER PASSWORD*/
exports.getNewPasswordForm = async (req, res, next) => {
    const token = req.params.token

    const user = await User.findOne({
        resetToken: token,
        // resetTokenExpiration: { $gt: Date.now() }
    })
    if (!user) {
        req.flash('error', 'User not Found')
        return res.redirect('/login')
    }
    else if (user.resetTokenExpiration < Date.now()) {// check expirtation of resetToken
        req.flash('error', `Sorry you link has expired. Please send another email to reset your password!`)
        return res.redirect('/reset')
    }

    res.render('users/new-password', { userId: user._id, passwordToken: token })

}

/*POST - UPDATE NEW USER PASSWORD*/
exports.postNewPassword = async (req, res, next) => {

    const { userId, passwordToken, password } = req.body
    const user = await User.findById(userId)
    if (user.resetTokenExpiration < Date.now()) {
        req.flash('error', 'Your link has expired please send a new email!')
        return res.redirect('/reset')
    }
    const fixedUser = await user.setPassword(password)
    user.resetTokenExpiration = undefined;
    user.resetToken = undefined;
    await user.save()

    req.login(fixedUser, (err) => {
        if (err) return next(err)
        req.flash('success', 'You have successfully Updated your password!')
        transporter.sendMail({
            to: user.email,
            // YOU NEED TO CREATE A VERIFIED SENDER IN YOUR SENDGRID ACCOUNT
            // WITH AN EXISTING ADDRESS EMAIL TO BE ABLE TO USE IT BELOW
            from: 'nozama.tr@gmail.com',
            subject: 'Password Changed',
            html: `<p>Dear ${user.username}</p>
            <p>You are receving this email, because you have recently updated your password on your compass account</p>`
        })
        res.redirect('/campgrounds')
    })

}
/*GET - USER PROFILE*/
exports.getUserProfile = async (req, res, next) => {

    const user = await User.findById(req.params.id)
    res.render('users/profile', { user })
}

/*POST/PATCH - UPDATE USER PROFILE*/
exports.editUserProfile = async (req, res, next) => {
    const id = req.params.id
    const user = await User.findByIdAndUpdate(id, { ...req.body })

    if (!user) {
        req.flash('error', 'No user found')
        return res.redirect('/login')
    }
    req.login(user, (err) => {
        if (err) return next(err)
        req.flash('success', 'You have successfuly updated your profile')
        res.redirect(`/profile/${user._id}`)
    })
}