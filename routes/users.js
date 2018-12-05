//Put any routes related to users in this file, to simplify the architecture.
const express = require('express');
const router = express.Router();  //A router object is an isolated instance of middleware and routes. You can think of it as a “mini-application,” capable only of performing middleware and routing functions.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); //encrypt password BEFORE it is stored in the database
const passport = require('passport');

const {ensureAuthenticated} =require('../helpers/auth'); //Defining ensureAuthenticated const to use it further as an additional argument.

const multer = require("multer");
const path = require("path");



const flash = require('connect-flash'); //The flash is a special area of the session used for storing messages. Messages are written to the flash and cleared after being displayed to the user. 

//Load User model
require('../models/User');
const User = mongoose.model('users'); //Load the model file,store the model in an variable

//User Profile Route
router.get('/profile',ensureAuthenticated,(req,res)=>{
  res.render('users/profile',{
   username:req.user.name,
   file: req.user.imgpath
  });
});
//User login Route
router.get('/login', (req, res) => { 
  res.render('users/login');
});

//User Register Route
router.get('/register', (req, res) => {
  res.render('users/register');
});

//Login Form POST
router.post('/login',(req,res,next) =>{
  passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash:true
  })(req,res,next);
});
//Register form POST
router.post('/register', (req, res) => {
  let errors = [];
  if (req.body.password != req.body.password2) {
    errors.push({ text: 'Passwords do not match' });
  }
  if (req.body.password.length < 4) {
    errors.push({ text: 'Password must be atleast 4 characters long' });
  }
  if (errors.length > 0) {
    res.render('users/register', {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2  //Passed in text fields after reloading so user doesn't have to enter everything again
    });
  } else {
    User.findOne({ email: req.body.email })
      .then(user => {
        if (user) {
          req.flash('error_msg', 'Email already registered.');
          res.redirect('/users/register');
        } else {
          const newUser = new User({   //create an object of the model User declared above
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            imgpath:null
          });
          bcrypt.genSalt(10, (err, salt) => {  // Salt is a random sequence of chars,concatenated with plaintext to hash it
            bcrypt.hash(newUser.password, salt, (err, hash) => {  //function to hash the password,store the hash as the password.
              if (err) throw err;
              newUser.password = hash;
              newUser.save()                   //Save it in database,create Flash success msg with text,redirect to login page
                .then(user => {
                  req.flash('success_msg', 'You are now registered and can log in.');
                  res.redirect('/users/login');
                })
                .catch(err => {
                  console.log(err);
                  return;
                })
            });
          });
        }
      });
    
  }
});

//Logout User
router.get('/logout',(req,res)=>{
  req.logout();    //Passport exposes a logout() function on req (also aliased as logOut()) that can be called from any route handler which needs to terminate a login session. Invoking logout() will remove the req.user property and clear the login session (if any).
  req.flash('success_msg','You are logged out');
  res.redirect('/users/login');
});

//Set storage engine
const storage = multer.diskStorage({
  destination:'./public/uploads/',
  filename:function(req,file,cb){      //Set storage engine,destination,and decide filename
    cb(null,req.user.id+path.extname(file.originalname).toLowerCase());
  } 
});

//Initialize Upload
const uploads=multer({
  storage:storage,
  limits:{fileSize: 1000000},          //Set limits on size,invoke fileFilter function on initialization
  fileFilter: (req,file,cb)=>{
    checkFileType(file,cb);
  }
}).single('myImage');

//Check File Type
function checkFileType(file,cb){
  //Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  //Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());  //Allowed filetypes
  //Check mime
  const mimetype=  filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else{
    cb('Error: Images Only');
  }
};	

//Upload avatar image 
router.post('/upload',(req,res) =>{    //If error,show error and rerender the page
   uploads(req,res,(err)=>{
     if(err){
      res.render('./users/profile',{     
        error_msg: err,
        username:req.user.name
      });
      
     } else{
      if(req.file ==undefined){
        res.render('./users/profile',{
          error_msg: 'Select an image first.',  //If no file is submitted
          username:req.user.name
        });
      }
      else{
        
        User.findOne({ email: req.user.email })
        .then(user => {
           if (user) { 
            user.imgpath="/uploads/"+req.file.filename;  //If img file submitted,find the user who submitted                                                  it and update the path to the imgpath field
            user.save()                  
             
          }

        });
      res.render('./users/profile',{                       //After that re-render the page with success msg                                                            and with file=the path which is caught by img                                                               src in 
        success_msg:'File Uploaded Successfully!',
        file: req.user.imgpath,
        username:req.user.name,
        
      });
       
        

      }
      
     }
   });
});

module.exports = router; //A module is a discrete program, contained in a single file in Node.js. Modules are therefore tied to files, with one module per file,module.exports is an object that the current module returns when it is "required" in another program or module.