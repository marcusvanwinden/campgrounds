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
      images: [
        {
          url:
            'https://res.cloudinary.com/marcusvanwinden/image/upload/v1615114684/Campgrounds/zcwjfzitylfpmp1boxgl.jpg',
          filename: 'Campgrounds/zcwjfzitylfpmp1boxgl',
        },
        {
          url:
            'https://res.cloudinary.com/marcusvanwinden/image/upload/v1615114684/Campgrounds/zpciifetrerf0otz9fvq.jpg',
          filename: 'Campgrounds/zpciifetrerf0otz9fvq',
        },
      ],
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
