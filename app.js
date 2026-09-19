// retrieves .env folder if not in production environment
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ quiet: true });
}

// Basic core DB and connection functionality
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');


// Page/form handlers
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
// Error handling
const ExpressError = require('./utils/ExpressError');
const flash = require('connect-flash');
// Authentication
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
// Security
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// Requiring route logic files
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');


// Mongp Database Connection
mongoose.set('strictQuery', true);

// connect to prod DB (Mongo Atlas)
// const prodDB = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
// mongoose.connect(prodDB);
// connect to dev DB (Mongo Local)
const devDB = 'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(devDB);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

// Setting up views
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}))

// By default this is in memory, we need to redirect it to mongo store in mongo db under 'sessions' collection

const store = MongoStore.create({
    mongoUrl: devDB,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function(e) {
    console.log("SESSION STOREV ERROR", e)
})

// Connection to session

const sessionConfig = {
    store,
    name:'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

// Header security and allowed content
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdn.maptiler.com/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdn.maptiler.com/"
];
const connectSrcUrls = [
    "https://cdn.jsdelivr.net/",
    "https://api.maptiler.com/"
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/xynuu4oc/", 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// Route handlers
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home')
});

app.all('/{*path}', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
});

const port = process.env.PORT || 3000;
    app.listen(port, () => {
    console.log(`Serving on port ${port}`)
});