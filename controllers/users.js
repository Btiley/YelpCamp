const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

module.exports.renderRegistrationForm = (req,res) => {
    res.render('users/register')
}

module.exports.registerUser = catchAsync(async(req,res,next) => {
    try {
        const {email,username,password} = req.body;
        // We store email and username in DB
        const user = new User ({email,username});
        // We encrypt the password before storing it
        const registeredUser = await User.register(user,password);
        // We login using passport once user is registered
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success','Welcome to Yelp Camp!');
            const redirectUrl = res.locals.returnTo || '/campgrounds';
            delete req.session.returnTo;
            res.redirect(redirectUrl)
        })
     
    } catch(e){
        req.flash('error',e.message)
        res.redirect('register')
    }
    
})

module.exports.renderLoginForm = (req,res) => {
    res.render('users/login');
}

module.exports.userLogin = (req,res) => {  
    // Authenticate auths and logs in, but this cant be done for a user that is to be created (in /register)
    // We store return to to allow usto access it later before authenicate clears session
    req.flash('success','welcome back!')
    // Checks what URL the user tried to access before registering
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    // removes the url after it has been set for redirect
    delete req.session.returnTo;
    res.redirect(redirectUrl)
}

module.exports.userLogOut = (req,res,next) => {  
    // We need to use callback to handle any errors (mandated by new version of passport)
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
    
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}