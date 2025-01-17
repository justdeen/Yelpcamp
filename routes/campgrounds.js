const express = require('express')
const router = express.Router()
const wrapAsync = require('../utils/wrapAsync')
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')
const campgrounds = require('../controllers/campgrounds')

router.route('/')
.get(wrapAsync(campgrounds.index))
.post(isLoggedIn, validateCampground, wrapAsync(campgrounds.postNewCampground))

router.route('/:id')
.get(wrapAsync(campgrounds.showCampground))
.put(isLoggedIn, isAuthor, validateCampground, wrapAsync(campgrounds.putEditedCampground))
.delete(isLoggedIn, isAuthor, wrapAsync(campgrounds.deleteCampground))

router.get('/new', isLoggedIn, campgrounds.newCampground)

router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(campgrounds.editCampground))

module.exports = router