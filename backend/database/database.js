const mongoose = require('mongoose');
require('dotenv').config(); // make sure .env is loaded

const dbUrl = process.env.MONGO_URL; // use the variable from .env

// Seed initial users and ensure they always exist
async function seedInitialUsers() {
  try {
    const User = require('../Models/user');

  // Desired users to ensure exist
  const adminSeed = {
      username: process.env.ADMIN_USERNAME || 'admin_user',
      firstname: process.env.ADMIN_FIRSTNAME || 'NerieAnn',
      lastname: process.env.ADMIN_LASTNAME || 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: process.env.ADMIN_ROLE || 'admin',
      department: process.env.ADMIN_DEPARTMENT || 'DEIE',
      employeeNumber: process.env.ADMIN_EMP_NO || 'A001',
    };
    const procSeed = {
      username: process.env.PROC_USERNAME || 'proc_officer',
      firstname: process.env.PROC_FIRSTNAME || 'BetteAnjanelle',
      lastname: process.env.PROC_LASTNAME || 'Procurement',
      email: process.env.PROC_EMAIL || 'procurement@example.com',
      password: process.env.PROC_PASSWORD || 'proc123',
      role: process.env.PROC_ROLE || 'procurement Officer',
      department: process.env.PROC_DEPARTMENT || 'DCE',
      employeeNumber: process.env.PROC_EMP_NO || 'A002',
    };

    // Helper to ensure an individual user exists (not batch)
    const ensureUser = async (seed) => {
      // Decide existence by unique username to avoid email collisions
      const existingByUsername = await User.findOne({ username: seed.username });
      if (existingByUsername) {
        console.log('[DB seed] Required user exists:', seed.username);
        return;
      }

      // If an account with same email but different username exists, warn and still create seed user
      const emailCollision = await User.findOne({ email: seed.email });
      if (emailCollision) {
        console.warn(
          `[DB seed] Email ${seed.email} already used by username ${emailCollision.username}. Creating required user ${seed.username} anyway.`
        );
      }

      await new User(seed).save();
      console.log('[DB seed] Created required user:', seed.username);
    };

    // Always ensure both users exist; do sequentially to avoid any batch-like behavior
    await ensureUser(adminSeed);
    await new Promise((resolve) => setTimeout(resolve, 150));
    await ensureUser(procSeed);

    console.log('Database is now running successfuly!');
  } catch (err) {
    console.error('[DB seed] Failed to ensure required users:', err);
  }
}

mongoose
  .connect(dbUrl)
  .then(async () => {
    console.log(`DB is connected! (${dbUrl})`);
  await seedInitialUsers();
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
