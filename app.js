const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// This a version of the ejs engine
const ejsMate = require('ejs-mate');
// Fetches JOI schema to validate serverside inputs
const {campgroundSchema,reviewSchema} = require('./schemas.js')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');

// Importing Models
const Campground = require('./models/campground');
const Review = require('./models/review');



// Connecting to Mongo DB (Strict query is boiler plate to avoid deprication warning)
mongoose.set('strictQuery', true);
// mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();
app.use(express.urlencoded({ extended: true })); 

// Used to set up EJS

// Uses the ejsmate engine instead of standard
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

// Uses JOI schema to check through request ensuring we have campground object
// and each value matches what we expect
const validateCampground = (req,res,next) => {

    // Throws an error if error is in result, throw breaks the flow
    const{error} = campgroundSchema.validate(req.body);
    if(error){
        // Result.details is an array, we need to map over it, we add comma if there are multiple.
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)  
    }
    else{
        next();
    }
}

// Middleware to run review through JOI validation

const validateReview = (req,res,next) => {

    // Throws an error if error is in result, throw breaks the flow
    // Express passes empty req as undefined, this prevents that issue.
    const{error} = reviewSchema.validate(req.body || {});
    if(error){
        console.log(error);
        // Result.details is an array, we need to map over it, we add comma if there are multiple.
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)  
    }
    else{
        next();
    }
}




app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))
// Creating Campground

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground,catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400)
    const campground = new Campground(req.body.campground);
    console.log(campground)
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))


// Retrieving Campground (show.ejs containing our reviews form)
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}))

// Updating Campground

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
}))

// Deleting Campground

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds');
}))

// Review Routes

// CREATING REVIEW - This is where review form submits
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id);

//    We fetch everything stored within the review part of body. (Square brackets in form feed in 
// Rating and Review text)


const review = new Review(req.body.review);
// We add the review on to the reviews array in campground model as a object id
// This is verified as working correctly
   campground.reviews.push(review);
   await review.save();
   await campground.save();
   res.redirect(`/campgrounds/${campground._id}`);

}))

// Delete route (Deleting review for specific campsite)
// We need to remove from campground model 
// We need to remove from review model.

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req,res) => {
    const {id,reviewId} = req.params
    // Pull takes review ID and pulls it out of array thus deleting it from campground model
    await Campground.findByIdAndUpdate(id, {$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))



// This ereror occurs if we call a route that does not exist (an express error)

app.all('/{*path}', (req,res,next) => {
    next(new ExpressError('Page Not Found', 404))
})

// This will pass new error with status code and message, we can create new .path errors.
// We set default to 500 and something went wrong.

app.use((err, req, res, next) => {
    const {statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})  