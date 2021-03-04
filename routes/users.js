const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post(
  '/register',
  catchAsync(async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registererdUser = await User.register(user, password);
      req.login(registererdUser, (error) => {
        if (error) return next(error);
        req.flash('success', `Welcome, ${registererdUser.username}`);
        res.redirect('/campgrounds');
      });
    } catch (error) {
      req.flash('error', error.message);
      res.redirect('/register');
    }
  })
);

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
  }),
  (req, res) => {
    req.flash('success', 'Welcome back');
    res.redirect('/campgrounds');
  }
);

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Goodbye');
  res.redirect('/campgrounds');
});

module.exports = router;
