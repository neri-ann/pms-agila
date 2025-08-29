const mongoose = require('mongoose');
require('dotenv').config();
const Vendor = require('./Models/supplyer');

// Connect to MongoDB
const dbUrl = process.env.MONGO_URL;
mongoose.connect(dbUrl)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Count all documents
    const totalCount = await Vendor.countDocuments({});
    console.log('Total vendor documents:', totalCount);
    
    // Get sample vendors
    const vendors = await Vendor.find({}).limit(5);
    console.log('Sample vendors:');
    vendors.forEach((vendor, i) => {
      console.log(`${i + 1}. ID: ${vendor._id}, Name: ${vendor.supplierName}, isDeleted: ${vendor.isDeleted}, createdAt: ${vendor.createdAt}`);
    });
    
    // Count active vendors (not deleted or undefined)
    const activeCount = await Vendor.countDocuments({
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }]
    });
    console.log('Active vendor count:', activeCount);
    
    // Count deleted vendors
    const deletedCount = await Vendor.countDocuments({ isDeleted: true });
    console.log('Deleted vendor count:', deletedCount);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
