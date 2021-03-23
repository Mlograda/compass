const Review = require("../models/review");
const Campground = require("../models/campground");

/*POST - CREATE NEW REVIEW*/
exports.postReview = async (req, res) => {

    const campground = await Campground.findById(req.params.id);

    const review = new Review(req.body.review);
    // review.reviewAuthor = req.user._id
    review.reviewAuthor = req.user._id
    review.campground = campground._id

    await review.save();
    campground.reviews.push(review);
    await campground.save();
    req.flash('success', 'You have successfully added a review!')
    res.redirect(`/campgrounds/${campground._id}`)
}

/*GET - EDIT EXISTING REVIEW REVIEW*/
exports.getEditReview = async (req, res, next) => {
    const editStatus = req.query.editStatus

    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author').populate('reviewAuthor');
    const reviewToEdit = await Review.findById(req.params.reviewId)

    const reviews = await Review.find({ _id: { $in: campground.reviews } }).populate('reviewAuthor');
    if (!campground) {
        req.flash('error', 'Campground not found!')
        return res.redirect('/campgrounds')
    }
    res.render("campgrounds/show", { campground, reviews, reviewToEdit, editStatus });
}

/*POST/PATCH - EDIT EXISTING REVIEW*/
exports.patchReview = async (req, res, next) => {
    const { reviewId, id } = req.params
    const review = await Review.findById(reviewId).populate('reviewAuthor')
    if (!review) {
        req.flash('error', 'This review is not found!')
        return res.redirect(`/campgrounds/${id}`)
    } else if (!review.reviewAuthor.equals(req.user._id)) {
        req.flash('error', `You don't have permission to modify this review!`)
        return res.redirect(`/campgrounds/${id}`)
    }
    await Review.findByIdAndUpdate(reviewId, { ...req.body.review })
    req.flash('success', 'You have successfully updated your review')
    res.redirect(`/campgrounds/${id}`)

}
/*DELETE - DELETE EXITING REVIEW*/
exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)

}