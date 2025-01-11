const path = require('path')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const ExpressError = require('./utils/ExpressError')
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')
const flash = require('connect-flash')

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
.then(() => {
    console.log('MONGODB CONNECTION OPEN')
})
.catch(err => {
    console.log('MONGODB CONNECTION ERROR')
    console.log(err)
})

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

app.get('/', (req, res) => {
    res.render('home')
})



// Reviews

// to delete all reviews in a campground
// app.get('/deleterevs/:id', async (req, res) => {
//     const {id} = req.params;
//     await Campground.updateOne({_id: id}, {$set: {reviews: []}}, {multi: true});
//     res.redirect(`/campgrounds/${id}`);
//     const campground = await Campground.findById(id)
//     console.log(campground)
// })

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