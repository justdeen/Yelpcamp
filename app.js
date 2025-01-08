const path = require('path')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const Campground = require('./models/campground')
const ejsMate = require('ejs-mate')
const wrapAsync = require('./utils/wrapAsync')
const ExpressError = require('./utils/ExpressError')
const {campgroundSchema, reviewSchema} = require('./joischema')
const Review = require('./models/review')

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
.then(() => {
    console.log('MONGODB CONNECTION OPEN')
})
.catch(err => {
    console.log('MONGODB CONNECTION ERROR')
    console.log(err)
})

app.engine('ejs', ejsMate)

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.get('/campgrounds/:id', wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    res.render('campgrounds/show', {campground})
}))

app.get('/campgrounds/:id/edit', wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
}))

app.post('/campgrounds', validateCampground, wrapAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.put('/campgrounds/:id', validateCampground, wrapAsync(async (req, res) => {
   const {id} = req.params
   const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
   res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', wrapAsync(async (req, res) => {
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

// Reviews

app.post('/campgrounds/:id/reviews', validateReview, wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.updateOne({_id: id}, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/campgrounds/${id}`);
    const campground = await Campground.findById(id)
    console.log(campground)
}))

// to delete all reviews in a campground
app.get('/deleterevs/:id', async (req, res) => {
    const {id} = req.params;
    await Campground.updateOne({_id: id}, {$set: {reviews: []}}, {multi: true});
    res.redirect(`/campgrounds/${id}`);
    const campground = await Campground.findById(id)
    console.log(campground)
})

app.all('*', (req, res, next) => {
   throw new ExpressError('Page not found', 404) 
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err
    if(!err.message) err.message = 'An error occured'
    res.status(statusCode).render('error', {err})
})

app.listen(3000, () => {
    console.log('CONNECTION ON PORT 3000')
})