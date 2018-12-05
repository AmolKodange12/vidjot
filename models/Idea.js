const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const IdeaSchema = new Schema({
  title:{
    type:String,
    required: true
  },
  details:{
    type:String,
    required: true  
  },
  user:{
    type:String,
    required:true        //For full access control,ie each user can only view their ideas only,user should be parameter to be compared.
  },  
  date:{
    type:Date,
    default:Date.now
  }
});

mongoose.model('Ideas',IdeaSchema);