const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// We fetch passport module
const passportLocalMongoose = require('passport-local-mongoose');
 
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        // Sets up index, is not validation
        unique: true
    }
});

// We plugin the passport module to help authenticate users
// Adds username, password, salt onto schema
UserSchema.plugin(passportLocalMongoose.default); 

// Compiling the model

module.exports = mongoose.model('User', UserSchema);