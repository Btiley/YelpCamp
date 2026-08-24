// Joi is a package used to validate server side data through schemas
const Joi = require('joi');

// Validates data before it reaches mongoose
// This checks if there is an error, but still makes campground

module.exports.campgroundSchema = Joi.object({
    // We require a campground object and the params in the form of Key[Value] if send from postman
    // SERVER Side Validation - We can export it to middleware to re-use on edit and new routes
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});

// We create a review schema to review server side based on JOI schema.

module.exports.reviewSchema = Joi.object({
    // We require a review object and the params in the form of Key[Value] if send from postman
    // SERVER Side Validation - We can export it to middleware to re-use on edit and new routes
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
});