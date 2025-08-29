const mongoose = require('mongoose');
require('dotenv').config(); // make sure .env is loaded

const dbUrl = process.env.MONGO_URL;  // use the variable from .env

mongoose.connect(dbUrl)
  .then(() => {
    console.log(`DB is connected! (${dbUrl})`);
  })
  .catch((ex) => {
    console.log('DB connection failed: ', ex);
  });


//   const mongoose = require('mongoose');

//   const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/procument_app'

// mongoose.connect(dbUrl) 
//   .then(() => {
//     console.log('DB is connected!');
//   })
//   .catch((ex) => {
//     console.log('DB connection failed: ', ex);
//   });
