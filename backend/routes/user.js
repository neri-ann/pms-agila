// Procument-Managemant-System\backend\routes\user.js
const router = require('express').Router();
const passport = require('passport');
const { create, changePassword, sendResetPasswordTokenStatus, resetPassword, signIn,updateUser, viewUsers,deleterUser, previewUser } = require('../controllers/user');
const { userValidator, validate, validatePassword, signInValidator } = require('../middlewares/validator');
const {isValidPassResetToken} =require("../middlewares/user");
const { isValidObjectId } = require('../Utils/helper');


// Add validation middleware
const validateUserId = (req, res, next) => {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    next();
};


// Add user create route
router.post("/create", userValidator, validate,create, (req, res) => {
    console.log("Received a request to create a user:", req.body);
    create(req, res);
  });
  // view all users
router.get('/view-users', viewUsers);
router.get("/preview-user/:id", validateUserId, previewUser);
router.put("/update/:id", validateUserId, updateUser);
router.delete("/delete/:id", validateUserId, deleterUser);
// add signIn route
router.post('/signIn', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message || 'Login failed' });
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ user });
    });
  })(req, res, next);
});
//Add forget Password route
router.post('/change-password', changePassword);
router.post('/verify-pass-reset-token',isValidPassResetToken,sendResetPasswordTokenStatus);
router.post('/reset-password', validatePassword, validate,isValidPassResetToken,resetPassword);


module.exports = router;








