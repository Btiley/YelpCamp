const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { cloudinary } = require("../cloudinary");
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

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

    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect('/campgrounds/new');
    }


    const campground = new Campground(req.body.campground);

    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;



    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // Adding user onto campground
    campground.author = req.user._id;
    await campground.save();
    // console.log('Campground:',campground);
    req.flash('success', 'Successfully made new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
})

// RETRIEVE
module.exports.retrieveCampground = catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        // populate the nested author on each review
        // We populate the reviews object with the user object
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
})
// Render Update Form
module.exports.renderUpdateForm = catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
})
// UPDATE
module.exports.updateCampground = catchAsync(async (req, res) => {
    const { id } = req.params;

    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);

    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect(`/campgrounds/${id}/edit`);
    }

    // Can try combine img uploads with find and update
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })

    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;

    // We need to convert the above out of array format, ... spread operator allows us to input them individually
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs);
    await campground.save()
    if (req.body.deleteImages) {
        // Delete from cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        // Delete from mongo array
        // We will pull campgrounds from array if they are in deleteImages parsed from form (user ticked)
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
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

