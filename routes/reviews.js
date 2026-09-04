const express=require('express');
const router = express.Router({mergeParams: true});
const reviews = require('../controllers/reviews');
const{isLoggedIn,validateReview,isReviewAuthor} = require('../middleware.js')
const Campground = require('../models/campground');
const Review = require('../models/review');
const ExpressError = require('../utils/catchAsync')
const catchAsync = require('../utils/catchAsync');



router.post('/', isLoggedIn, validateReview, reviews.createReview)


router.delete('/:reviewId',isLoggedIn,isReviewAuthor, reviews.deleteReview)

module.exports = router;