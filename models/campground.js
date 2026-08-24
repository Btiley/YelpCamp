const mongoose = require('mongoose');
const Review = require('./review');
// We reference schema alot in relationships, this is a shortcut.
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        // Fetches the object ID from review model
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

// We add our mongoose middleware to delete from reviews db
// When campground is deleted it is passed into thjis middleware.

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    console.log(doc);
    if(doc){
        // Finds any ID in the recently deleted campground and deletes
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)