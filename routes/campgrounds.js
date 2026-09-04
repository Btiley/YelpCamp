const express=require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const{isLoggedIn,validateCampground,isAuthor} = require('../middleware.js');
const methodOverride = require('method-override');
const Campground = require('../models/campground');

router.route('/')
// Show all campgrounds 
.get(campgrounds.index)
// (C)reate New Campground
.post(isLoggedIn, validateCampground,campgrounds.createCampground)

// New Campground Form
router.get('/new',isLoggedIn,campgrounds.renderNewForm);

router.route('/:id')
// (R)etrieve Campground
.get(campgrounds.retrieveCampground)
// (U)pdate Campground 
.put(isLoggedIn,isAuthor,validateCampground,campgrounds.updateCampground)
// (D)elete Campground
.delete(isLoggedIn,isAuthor, campgrounds.deleteCampground)

// New User Form
router.get('/:id/edit',isLoggedIn, isAuthor, campgrounds.renderUpdateForm);

module.exports = router;