//Put any routes related to ideas in this file, to simplify the architecture.
const express = require('express');
const router = express.Router();  //A router object is an isolated instance of middleware and routes. You can think of it as a “mini-application,” capable only of performing middleware and routing functions.
const mongoose = require('mongoose');

//Load the mongoose model
require('../models/Idea'); //Since we are using Idea model,we need to load that, .means same folder, ..means one level up.
const Idea = mongoose.model('Ideas');

const {ensureAuthenticated} =require('../helpers/auth'); //Defining ensureAuthenticated const to use it further as an additional argument.

//Plain copying routes related to ideas from app.js to here won't do,we have to- replace all app methods with router,and replace /ideas with / in the url param.


//Idea Index Page 
router.get('/',ensureAuthenticated, (req,res) =>{ 
  if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi'); 
    Idea.find({user:req.user.id,title:regex})  //find ideas only of the user logged in and title matched with                                                  searched query
    .sort({date:'desc'})
    .then(Ideas => {
      var ideaCount=Ideas.length;
     
      res.render('ideas/index',{   //if record found,render ideas/index page,and fill an array with the mongodb records
        username:req.user.name,
        ideas:Ideas,
        ideacount:ideaCount
        
        
      });
     
    });
  }

else{
  Idea.find({user:req.user.id})   //Find records from MongoDB's mongoose model,such that ideas are of the user id logged in.
  .sort({date:'desc'})  //Sort them by date-newest first
  .then(Ideas => {
    var ideaCount=Ideas.length;
   
    res.render('ideas/index',{   //if record found,render ideas/index page,and fill an array with the mongodb records
      username:req.user.name,
      ideas:Ideas,
      ideacount:ideaCount
      
      
    });
   
  });
}

  
  
});

// Add Idea Form
router.get('/add', ensureAuthenticated,(req,res) => {
  res.render('ideas/add',{
    username:req.user.name
  });
});

// Edit Idea Form
router.get('/edit/:Id',ensureAuthenticated, (req,res) => {
  Idea.findOne({     //Find that record whose objectID (_id) is equal to that passed in the href in index.hbs 
    _id: req.params.Id
  })
  .then(idea =>{
    if(idea.user!=req.user.id){
      req.flash('error_msg','Not authorized');
      res.redirect('/ideas');
    }else{
      res.render('ideas/edit',{   //When found render ideas/edit passing idea array with the values of the record 
        username:req.user.name,
        idea:idea
      });
    }   
    
  });
});

//Process Add Idea Form
router.post('/',ensureAuthenticated,(req,res) => {
  let errors=[];
  if(!req.body.title){
    errors.push({text:'Please add a title'});
  }
  if(!req.body.details){
    errors.push({text:'Please add some details'});
  }

  if(errors.length > 0){
    res.render('/add',{
      errors :errors,
      title: req.body.title,
      details: req.body.details
    });
  } else{
    const newUser={
      title: req.body.title,
      details: req.body.details,
      user:req.user.id
    }
    new Idea(newUser)
    .save() 
    .then(() => {
      
      req.flash('success_msg','Video Idea Added')
      res.redirect('/ideas'); 
         
    })  
  }
});    //Three goals acheived here-reloading the form,keeping entered text fields populated if entered,displaying errors.

//Edit Form Process
router.put('/:id', ensureAuthenticated,(req,res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(IDEA=> {
    //new values
    IDEA.title = req.body.title;
    IDEA.details=req.body.details;

    IDEA.save()
    .then(() =>{
      req.flash('success_msg','Video Idea Updated')
      res.redirect('/ideas');
    })    
  });
});

//Delete Idea
router.delete('/:id',ensureAuthenticated,(req,res) =>{
  Idea.deleteOne({
    _id : req.params.id
  })
  .then(() =>{
    req.flash('error_msg','Video Idea Removed')
    res.redirect('/ideas'); 
  });
}); 

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"); //funtction to be used in search-bar
};

module.exports = router; //A module is a discrete program, contained in a single file in Node.js. Modules are therefore tied to files, with one module per file,module.exports is an object that the current module returns when it is "required" in another program or module.