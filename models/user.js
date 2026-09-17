const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
 
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        // Sets up index, is not validation
        unique: true
    }
});

// Adds username, password, salt onto schema
UserSchema.plugin(passportLocalMongoose.default); 

module.exports = mongoose.model('User', UserSchema);