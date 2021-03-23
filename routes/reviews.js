const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utilities/catchAsync");
const reviews = require('../controllers/reviews')
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');


/*POST NEW REVIEW*/
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.postReview))

/*GET- EDIT REVIEW*/
router.get('/:reviewId/edit', isLoggedIn, catchAsync(reviews.getEditReview))

/*POST/PATCH/PUT- EDIT REVIEW*/
router.patch('/:reviewId', isLoggedIn, validateReview, catchAsync(reviews.patchReview))

/*DELETE- DELETE  REVIEW*/
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))
module.exports = router;