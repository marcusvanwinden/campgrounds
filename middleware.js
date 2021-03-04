function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    req.flash('error', 'Must be signed in first');
    return res.redirect('/login');
  }
  next();
}

module.exports.isLoggedIn = isLoggedIn;
