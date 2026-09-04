// We run in dev mode, prod is only once we deploy
// Adds into process.env in dev, in production we don't do this
if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

console.log(process.env.SECRET);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// This a version of the ejs engine
const ejsMate = require('ejs-mate');
// Fetches express so we can use flash to display tempt messages
const session = require('express-session');
const flash = require('connect-flash')
// Fetches JOI schema to validate serverside inputs
const {campgroundSchema,reviewSchema} = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');

// Authentication
const passport = require('passport');
const LocalStrategy = require('passport-local');

// Importing Models
const Campground = require('./models/campground');
const Review = require('./models/review');
const User = require('./models/user');

// Brining in Routes from router folder

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');




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
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// We get express to serve public directory
// path allows us to serve from the 'public' directory
app.use(express.static(path.join(__dirname,'public')));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    // We can set some properties on session cookie
    cookie: {
        // http only prevents accessing cookies from client.
        httpOnly: true,
        // Date now is current time in millioseconds, a week is in a week
        // 1000 ms in sec,60 in minute, 60 in hour, 24 in day, 7 days in week
        // Expiration avoids login from staying forever.
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
// flash comes after as it dependant on session so logically it would be after
app.use(flash());

// Authentication

app.use(passport.initialize());
app.use(passport.session());
// authenticate is a static method added on to user model using 'local' auth
passport.use(new LocalStrategy(User.authenticate()));

// How do we store user in the session/remove them.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// We set up a local variable to pass any flash info on

app.use((req,res,next) => {
    // all templates have access to currentUser, depends if we have a 'current user'
    // console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success'); 
    res.locals.error = req.flash('error');   
    next();
})

// This hard codes a fake user. (rather than post request)
app.get('/fakeUser', async (req,res) => {
    const user = new User({email:'c3@gmail.com', username: 'colt12'})
    // Creates new user and saves encrypted password
    const newUser = await User.register(user,'chicken');
    res.send(newUser);
})



// Route handlers
app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);


app.get('/', (req, res) => {
    res.render('home')
})

// This error occurs if we call a route that does not exist (an express error)

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