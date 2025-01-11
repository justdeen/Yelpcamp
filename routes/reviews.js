const express = require('express')
const router = express.Router({mergeParams: true})
const wrapAsync = require('../utils/wrapAsync')
const Campground = require('../models/campground')
const Review = require('../models/review')
const {reviewSchema} = require('../joischema')
const ExpressError = require('../utils/ExpressError')

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

router.post('/', validateReview, wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', wrapAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.updateOne({_id: id}, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`);
    const campground = await Campground.findById(id)
}))

module.exports = router