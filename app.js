if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const mongoSanitize = require('express-mongo-sanitize');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/campgrounds';
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

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

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: dbUrl,
      touchAfter: 24 * 60 * 60,
      secret,
    }),
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(helmet());
const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com/',
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://kit.fontawesome.com/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net',
];
const styleSrcUrls = [
  'https://kit-free.fontawesome.com/',
  'https://stackpath.bootstrapcdn.com/',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://use.fontawesome.com/',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css',
];
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://res.cloudinary.com/marcusvanwinden/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        'https://images.unsplash.com/',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  next();
});
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong';
  res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
