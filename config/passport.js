const localStrategy=require('passport-local').Strategy;
const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

//Load user models
const User=mongoose.model('users');

module.exports = function(passport){
  passport.use(new localStrategy({usernameField:'email'},(email,password,done) => {
    //Match the User
    User.findOne({
      email:email  //email of database object matches the one passed in the login form.
      }) .then(user=>{
        if(!user){  
          return done(null,false,{message:'No user found'});
        }

    //compare the non hashed password passed in the form with the hashed password in the database
    bcrypt.compare(password,user.password,(err,isMatch)=>{
      if(err) throw err;
      if(isMatch){
        return done(null,user)
      }else{
        return done(null,false,{message:'Password Incorrect'});
      }
    })
      })
  }));
  passport.serializeUser(function(user, done) {   //Saves the user id of the user logged in into the session,accessible by id
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {  //Finds the user from the database with id stored in session and load database records pertaining to it.
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  
} 