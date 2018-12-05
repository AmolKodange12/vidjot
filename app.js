

//app.get,app.use,app.post are callback functions,executed when specific requests are made to specified url.
const express = require('express');
const path = require('path');
const exphbs  = require('express-handlebars'); //template engine 
const mongoose=require('mongoose');//Object data modelling app for mongodb
const bodyParser = require('body-parser');//Middleware that extracts the entire body portion of an incoming request stream and exposes it on req.body.
const methodOverride = require('method-override') //Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
const session = require('express-session'); //Sessions are a place to store data across http requests.
const flash = require('connect-flash'); //The flash is a special area of the session used for storing messages. Messages are written to the flash and cleared after being displayed to the user. 
const passport = require('passport');
//(req,res) =>{Code}; creates a function that takes params as req-object containing methods use to change request object ,and res object containing methods for response.

const multer = require('multer');

const app = express(); //initialize application

//Load Ideas Routes
const ideas = require('./routes/ideas');

//Load Users Routes
const users = require('./routes/users');



//Load the mongoose model
require('./models/Idea'); //Since we are using Idea model,we need to load that, .means same folder, ..means one level up.
const Idea = mongoose.model('Ideas');


//Load User model
require('./models/User');
const User = mongoose.model('users'); //Load the model file,store the model in an variable



//Passport Config
require('./config/passport')(passport);

//DB config
const db = require('./config/database') //require the file here to be used

//Connect to mongoose
mongoose.connect(db.mongoURI,{  //refer the object dbb.mongoURI instead of plain string as database
  useNewUrlParser:true
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));



//Handlebars middleware-telling system we wanna use handlebars as a template engine.
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//app.use and app.METHOD(method can be get,post, or put) are middleware functions-functions that have access to req and res objects. 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Static Folder
app.use(express.static(path.join(__dirname,'public'))); //Makes able to use any assets from the public folder.

//Method Override Middleware
app.use(methodOverride('_method'));

//Middleware for Express-session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Global variables
app.use(function(req,res,next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user =req.user ||null;

  next();
});




//Index Route
app.get('/',(req,res) => {
  if(req.user!=null){
    const title = 'Welcome';
  res.render('index', {
    username:req.user.name,  //User name from request is set equal to username which is used in navbar to show username,                              if user is not null,ie logged in.
    title : title
  }); 
  }
  else{
    const title = 'Welcome';
  res.render('index', {
                   //else just show the page to user without username variable,which is not needed anyways.
    title : title
  }); 
  }
   
});




//About Route
app.get('/about',(req,res) => {     //Same as Above
  if(req.user!=null){
    res.render('about',{
      username:req.user.name
    }); 
  }
  else{
    res.render('about',{
      
    });
  }
  
});



//Use Route
app.use('/ideas',ideas);// Route to ideas.js file when /ideas is called

//Use Route
app.use('/users',users);// Route to users.js file when /users is called



const port=process.env.PORT || 5000; //In many environments (e.g. Heroku), and as a convention, you can set the environment variable PORT to tell your web server what port to listen on.   

app.listen(port, () =>{   //arrow functions
  console.log(`Server started on port ${port}`); //backticks not quotes
});

  