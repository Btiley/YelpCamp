const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const ImageSchema = new Schema({
    url: String,
    filename: String
});

// We can set up a virtual parameter on every schema
// Virtual does not need to be stored on DB, we are manipulating what we already have in db
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200,h_200/')
    console.log("url")
})

// Prevent resize of carousel
ImageSchema.virtual('cardImage').get(function () {
    return this.url.replace('/upload', '/upload/ar_4:3,c_crop')
})
// Virtuals convert to JSON
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    // This geometry is the Lat/Long that we get from map tiler
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'

    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

// Calculated based on database, not directly stored.
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        // Finds any ID in the recently deleted campground and deletes
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)