const express = require('express')
const router= express.Router()
const catchAsync=require('../utils/catchAsync.js')
const Campground = require('../models/campground.js')
const campgrounds = require('../controllers/campgrounds')
const ExpressError = require('../utils/ExpressError');
const {isLoggedIn , isAuthor , validateCampground} =require('../middleware')


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))


router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor,  validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
 
 module.exports=router