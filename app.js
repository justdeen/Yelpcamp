const path = require('path')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const ExpressError = require('./utils/ExpressError')
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')

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

app.use(passport.initialize());
app.use(passport.session());  //has to be used before the session middleware
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req, res, next) => {
    // console.log('REQ.USER...', req.user);
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})


app.use('/', userRoutes)
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/fakeuse', async (req, res) => {
    const user = new User({email: 'fake@mail.com', username: 'sheriff'})
    const newUser = await User.register(user, 'monkey')
    res.send(newUser) 
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