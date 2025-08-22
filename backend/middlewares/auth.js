// Procument-Managemant-System\backend\middlewares\auth.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../Models/user'); // Import your User model


// Define the local strategy
passport.use(new LocalStrategy({
    usernameField: 'email', // Assuming email is used as the username
    passwordField: 'password',
    passReqToCallback: true // Pass request object to callback
  },
  async function(req, email, password, done) {
    const { role } = req.body; // Extract role from request body


    try {
      // Find user by email in your database
      const user = await User.findOne({ email });


      // If user not found or password doesn't match, return error
      if (!user || !(await user.comparePassword(password))) {
        return done(null, false, { message: 'Invalid email or password' });
      }


      // If provided role is not in user's role, return error
      if (!user.role.includes(role)) {
        return done(null, false, { message: 'Invalid role' });
      }


      // If everything is correct, return the user
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));


// Serialize user into session
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user.id);
});


// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  console.log('Deserializing user:', id);
    try {
        // Add validation for id
        if (!id || id === 'undefined') {
            return done(new Error('Invalid user ID'));
        }
       
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});


exports.isAuthenticated = (req, res, next) => {
    console.log('Session:', req.session);
    console.log('User:', req.user);
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
