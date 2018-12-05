if(process.env.NODE_ENV === 'production'){
  module.exports = {mongoURI: 'mongodb://Amol:amolk123@ds127094.mlab.com:27094/vidjot-prod'}
} else{
  module.exports = {mongoURI: 'mongodb://localhost/vidjot-dev'}
}
//If in development use local database,if in production in heroku, use the mlab database.