const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt =require("bcrypt");

const supplyerSchema = new Schema({
  username: {  // Add a unique username field
    type: String,
    unique: true, // Ensure uniqueness
    // required: true,
    index: true
  },
 
  supplierId:{
    type: String,
    index: true
  }, 
  supplierName:{
    type: String,
    // required: true,
    index: true
  }, 
  email: {
    type: [String],
    index: true

  }, 
  address:{
    type: String,

  }, 
  contactOfficer:{
    type: String,

  }, 
  contactNumber :{
    type: [String,]

  }, 
  faxNumber1 :{
    type: String,

  }, 

  faxNumber2 :{
    type: String,

  }, 
  typeofBusiness:{
    type: String,
    index: true
    // default: 'SoleImporter',
    // enum: ['SoleImporter', 'SoleDistributor ','LocalAgent','contractors']
  },
  classOfAssets :{
    type: String,
    index: true

  },
});



module.exports = mongoose.model('Supplyer', supplyerSchema);