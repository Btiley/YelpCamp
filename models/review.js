const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// One to many, one campground will have many reviewes
// We will store each review in a array on campground module
const reviewSchema = new Schema({
    rating: Number,
    body: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

// By using Review, this creates reviews database in mongo
module.exports = mongoose.model("Review", reviewSchema);