const express=require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const methodOverride = require('method-override');
const{isLoggedIn,validateCampground,isAuthor} = require('../middleware.js');
const Campground = require('../models/campground');

// Multer Routes (for parsing files)
const multer  = require('multer')
// This is where multer will store images that are parsed to files
const upload = multer({ dest: 'uploads/' })


router.route('/')
    .get(campgrounds.index)
    // We are temporarily commenting this out to check outputs
    // .post(isLoggedIn, validateCampground,campgrounds.createCampground)
    // Middleware will add our 'image' file to req.files and rest to req.body
    .post(upload.array('image'),(req,res) => {
        console.log(req.body,req.files);
        res.send("Parsed")
    })

router.get('/new',isLoggedIn,campgrounds.renderNewForm);

router.route('/:id')
    .get(campgrounds.retrieveCampground)
    .put(isLoggedIn,isAuthor,validateCampground,campgrounds.updateCampground)
    .delete(isLoggedIn,isAuthor, campgrounds.deleteCampground)

router.get('/:id/edit',isLoggedIn, isAuthor, campgrounds.renderUpdateForm);

module.exports = router;