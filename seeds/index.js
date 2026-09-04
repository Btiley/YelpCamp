const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

// Used to call unsplash api for random image
const axios = require('axios')

const cities = require('./cities');
const { places, descriptors } = require('./seedhelpers');
const Campground = require('../models/campground')




// Connecting to Mongo DB (Strict query is boiler plate to avoid deprication warning)
mongoose.set('strictQuery', true);
// mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Pick random place/descriptor

const sample = array => array[Math.floor(Math.random() * array.length)]

// call unsplash and return small image
async function seedImg() {
    try {
        const resp = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                client_id: 'Qb3XnbRMDVvXbE5mXTzl77_fLigEqRjPHHD45IDIjw4',
                collections: 1114848,
            },
        })
        return resp.data.urls.small
    } catch (err) {
        console.error(err)
    }
}

const seedDB = async () => {
    // Clears DB
    await Campground.deleteMany({});
    // Adds 50 locations with 50 sample names, chosen randomly from array
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6a95f370bcc6d2005413362d',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: await seedImg(),
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure, veniam quidem numquam adipisci dolorem quibusdam amet odit totam aperiam necessitatibus itaque nostrum distinctio perferendis quaerat nam quos libero, unde rem!',
            price
        })
        await camp.save();
    }
}

// So, instead of this line in your seeds/index.js code:

// image: 'https://source.unsplash.com/collection/483251',
// Change that line to exactly the line shown below (copy-paste the line below into your code as a replacement):

// image: `https://picsum.photos/400?random=${Math.random()}`,




// We close DB

seedDB().then(() => {
    mongoose.connection.close();
})