const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost/campgrounds', {
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

  for (let i = 0; i < 50; i++) {
    const randomCity = randomChoice(cities);
    const randomPrice = Math.floor(Math.random() * 20) + 10;
    const campground = await new Campground({
      author: '6040d5c47cb4aae52696833c',
      location: `${randomCity.city}, ${randomCity.state}`,
      title: `${randomChoice(descriptors)} ${randomChoice(places)}`,
      image: `https://source.unsplash.com/collection/483251`,
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, quod praesentium eligendi ea obcaecati hic voluptate natus harum enim, aliquam, molestiae eius repellat assumenda placeat corrupti perspiciatis blanditiis pariatur aspernatur.',
      price: randomPrice,
    });
    await campground.save();
  }
}

seedDB().then(() => {
  db.close();
});
