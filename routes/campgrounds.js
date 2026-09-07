const express=require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const methodOverride = require('method-override');
const{isLoggedIn,validateCampground,isAuthor} = require('../middleware.js');
const Campground = require('../models/campground');

// Multer Routes (for parsing files)
const multer  = require('multer')
// Node will auytomatically look for index js
const {storage} = require('../cloudinary');
// This is where multer will store images that are parsed to files
const upload = multer({ storage })


router.route('/')
    .get(campgrounds.index)
    // We will upload images before we validate due to how malter works, to be fixed later
    .post(isLoggedIn, upload.array('image'),validateCampground,campgrounds.createCampground)
   

router.get('/new',isLoggedIn,campgrounds.renderNewForm);

router.route('/:id')
    .get(campgrounds.retrieveCampground)
    .put(isLoggedIn,isAuthor, upload.array('image'), validateCampground,campgrounds.updateCampground)
    .delete(isLoggedIn,isAuthor,campgrounds.deleteCampground)

router.get('/:id/edit',isLoggedIn, isAuthor, campgrounds.renderUpdateForm);

module.exports = router;