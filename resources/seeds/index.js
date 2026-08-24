// const express = require('express');
// const path = require('path')
// const mongoose = require('mongoose');
// const Campground = require('../models/campground')

// Connecting to Mongo DB (Strict query is boiler plate to avoid deprication warning)
// mongoose.set('strictQuery', true);
// mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });

// const seedDB = async () => {
//     await Campground.deleteMany({});
//     const c = new Campground({ title: 'purple field' });
//     await c.save();
// }

console.log("TESTING")