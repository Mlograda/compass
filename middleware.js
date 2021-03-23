const Campground = require("./models/campground")
const Review = require("./models/review")
const User = require("./models/user")
const ExpressError = require("./utilities/ExpressError");
const { reviewSchema, campgroundSchema, userSchema, passwordSchema } = require('./schemas.js');

module.exports.isLoggedIn = (req, res, next) => {

    if (req.query.newcamp === 'True' && !req.isAuthenticated()) {
        req.session.trackingUrl = req.originalUrl
        req.flash('error', 'You must login first!')
        return res.redirect('/login?newcamp=True')
    }
    else if (!req.isAuthenticated()) {

        return res.redirect('/login')
    }

    next()

}


exports.sendRevoceryPassword = async (req, res, next) => {
    const token = req.params.token
    const user = await findOne({ resetToken: token })
    if (user.resetTokenExpiration < Date.now()) {
        res.flash('error', `Sorry you link has expired`)
        return res.redirect('/reset')
    }
    next()
}

exports.redirectBack = (req, res, next) => {
    console.log(req.get('referer'))
    res.redirect(req.get('referer'));
}
module.exports.validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');

        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports.isCampgroundAuthor = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Campground not found!')
        return res.redirect('/campgrounds')
    }
    else if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'stop doing this fuck its not your campground')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}


module.exports.validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);
    const { review } = req.body

    if (review.rating < 1) {

        req.flash('error', 'please select a rating!')
        return res.redirect(`/campgrounds/${req.params.id}`)
    } else if (review.body.length <= 0) {
        req.flash('error', 'please enter a review!')
        return res.redirect('back')
    }
    else if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next()
    }

}
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params

    const review = await Review.findById(reviewId).populate('campground')

    if (!review.reviewAuthor.equals(req.user._id)) {
        req.flash('error', `You don't have permission to delete this review`)
        return res.redirect(`/campgrounds/${id}`)
    }
    next()

}

exports.validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body)
    const { password, repeatPassword } = req.body
    if (password !== repeatPassword) {
        req.flash('error', 'confirm password does not match password')
        return res.redirect('back')
    }
    else if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)

    } else {
        next()
    }
}

exports.validatePassword = (req, res, next) => {
    const { password, repeatPassword } = req.body
    const { error } = passwordSchema.validate({ password, repeatPassword })

    if (password !== repeatPassword) {
        console.log('im here')
        req.flash('error', 'confirm password does not match password')
        return res.redirect('back')
    } else if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)

    }
    else {
        next()
    }
}