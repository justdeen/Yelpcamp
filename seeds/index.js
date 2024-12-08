const mongoose = require('mongoose');
const axios = require('axios')
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
.then(() => {
    console.log('MONGODB CONNECTION OPEN')
})
.catch(err => {
    console.log('MONGODB CONNECTION ERROR')
    console.log(err)
})

const sample = array => array[Math.floor(Math.random() * array.length)];

let api = async () => {
    let imgsrc = []
    for (let i = 0; i < 2; i++){
        let res = await axios.get(`https://api.unsplash.com/photos/random?collections=9046579,E9lsVbOga1E&count=25&client_id=p6JqrsE_E8gFpLIAwtx6vw3MFUrT3DC7yT6PtOPKSRE`)
        let urls = res.data
        imgsrc.push(...urls)
    }
    return imgsrc
}

const seedDB = async () => {
    await Campground.deleteMany({});
    let test = await api();
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        // const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: test[i].urls.small,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto.',
        })
        await camp.save();
    }
}

Campground.find({}).then(data => console.log(data));

// seedDB()

// .then(() => {
//     mongoose.connection.close();
// })