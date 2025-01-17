const User = require('../models/user')

module.exports.newUserForm = (req, res) => {
    res.render('users/register')
}

module.exports.postNewUser = async (req, res, next) => {
    try {
        const {email, username, password} = req.body
        const user = new User({email, username}) 
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success','Welcome to yelp camp!')
            res.redirect('/campgrounds')
        })
    } catch(e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.loginForm = (req, res) => {
    res.render('users/login')
}

module.exports.postLoginForm = (req, res) => {
    req.flash('success','Welcome back!')
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if(err) {
            return next(err)
        }
        req.flash('success', 'Goodbye')
        res.redirect('/campgrounds')
    })
}