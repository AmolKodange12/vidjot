module.exports = { //Uses the isAuthenticated function from passport to verify whether user is logged in b4 accessing pages
  ensureAuthenticated: function (req, res, next) {

    if (req.isAuthenticated()) {
      return next();

    }

  
    req.flash('error_msg', 'Not Authorized');
    res.redirect('/users/login');



  }
}