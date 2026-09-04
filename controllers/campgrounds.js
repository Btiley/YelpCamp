const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync')

// Show All
module.exports.index = catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})

// Render Create Form
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new'); 
}

// CREATE
module.exports.createCampground = catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    // Adding user onto campground
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
})

// RETRIEVE
module.exports.retrieveCampground = catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        // populate the nested author on each review
        // We populate the reviews object with the user object
        path:'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground});
})
// Render Update Form
module.exports.renderUpdateForm = catchAsync(async (req, res) => {
    const {id} = req.params; 
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
})
// UPDATE
module.exports.updateCampground = catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)    
})
// DELETE
module.exports.deleteCampground = catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds');
})

