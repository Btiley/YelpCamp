const express=require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const{isLoggedIn,validateCampground,isAuthor} = require('../middleware.js');
const methodOverride = require('method-override');
const Campground = require('../models/campground');
// Allows us to do multi part
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

router.route('/')
// Show all campgrounds 
.get(campgrounds.index)
// (C)reate New Campground
// .post(isLoggedIn, validateCampground,campgrounds.createCampground)
.post(upload.array('image'),(req,res) => {
    console.log(req.body,req.files);
    res.send("YOU MAY PARSE!")
})

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