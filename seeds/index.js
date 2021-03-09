const mongoose = require('mongoose');
const cities = require('./cities');
const images = require('./images');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

// const dbUrl = 'mongodb://localhost:27017/campgrounds';
const dbUrl =
  'mongodb+srv://marcusvanwinden:satbok-vogmex-7zodTo@campgrounds.w5slp.mongodb.net/Campgrounds?retryWrites=true&w=majority';

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Database connected');
});

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function seedDB() {
  await Campground.deleteMany({});

  for (let i = 0; i < 20; i++) {
    const randomCity = randomChoice(cities);
    const randomPrice = Math.floor(Math.random() * 20) + 10;
    const campground = await new Campground({
      title: `${randomChoice(descriptors)} ${randomChoice(places)}`,
      geometry: {
        type: 'Point',
        coordinates: [randomCity.longitude, randomCity.latitude],
      },
      price: randomPrice,
      author: '604682f02e8222bd36b415db',
      location: `${randomCity.city}, ${randomCity.state}`,
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, quod praesentium eligendi ea obcaecati hic voluptate natus harum enim, aliquam, molestiae eius repellat assumenda placeat corrupti perspiciatis blanditiis pariatur aspernatur.',
      images: [images[Math.floor(Math.random() * images.length)]],
    });
    await campground.save();
  }
}

seedDB().then(() => {
  db.close();
});
