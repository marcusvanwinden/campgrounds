const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');

function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'Must be signed in first');
    return res.redirect('/login');
  }
  next();
}

async function isAuthor(req, res, next) {
  const campground = await Campground.findById(req.params.id);
  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that');
    return res.redirect(`/campgrounds/${req.params.id}`);
  }
  next();
}

async function isReviewAuthor(req, res, next) {
  const review = await Review.findById(req.params.reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that');
    return res.redirect(`/campgrounds/${req.params.id}`);
  }
  next();
}

function validateCampground(req, res, next) {
  const { error } = campgroundSchema.validate(req.body);

  if (error) {
    const message = error.details.map((element) => element.message).join(', ');
    throw new ExpressError(message, 400);
  } else {
    next();
  }
}

function validateReview(req, res, next) {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const message = error.details.map((element) => element.message).join(', ');
    throw new ExpressError(message, 400);
  } else {
    next();
  }
}

module.exports.isLoggedIn = isLoggedIn;
module.exports.isAuthor = isAuthor;
module.exports.isReviewAuthor = isReviewAuthor;
module.exports.validateCampground = validateCampground;
module.exports.validateReview = validateReview;
