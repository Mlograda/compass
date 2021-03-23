// write to db so require mongoose 

const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
///////////////////////mongoose connection-/////////////////////////////////////////
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('we are connected to data base')
});
//////////////////////////////////////////////////////////////////////////////////
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const price = Math.floor((Math.random() * 20) + 10);
        const randomNum = Math.floor(Math.random() * 1000);
        await Campground.insertMany([{
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[randomNum].city}, ${cities[randomNum].state}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dq6oml6je/image/upload/v1615886337/YelpCamp/k8rjfqpdlkvllad0mpy1.jpg',
                    filename: 'YelpCamp/k8rjfqpdlkvllad0mpy1'
                },

                {
                    url: 'https://res.cloudinary.com/dq6oml6je/image/upload/v1615886337/YelpCamp/dxazzt5vuwygf4uvoncg.jpg',
                    filename: 'YelpCamp/dxazzt5vuwygf4uvoncg'
                }
            ],

            geometry: {
                type: 'Point',
                coordinates: [cities[randomNum].longitude, cities[randomNum].latitude]
            },
            price: price,
            author: '60478b55bbb793380cd0e537',
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Facilis ratione possimus assumenda, dolores eum ad? Quis non harum inventore quam ea hic exercitationem, magnam cupiditate eos odit? Rerum, incidunt eaque?'
        }]);


    }
}


seedDB().then(() => {
    mongoose.connection.close();
});