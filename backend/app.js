const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
require('./middlewares/auth'); // Make sure this sets up passport strategies

const app = express();
require('express-async-errors');
require('dotenv').config();
require('./database/database');
require('./middlewares/error');

const userRouter = require("./routes/user");
const { errorHandler } = require('./middlewares/error');
const supplyerRouter = require('./routes/supplyer');
const itemRouter = require('./routes/Item');
const guidanceRouter = require('./routes/guidanceDoc');
const noticeRouter = require('./routes/noticeDoc');
const procReqestRouter = require('./routes/procReqest');
const procProjectRouter = require('./routes/procProject');
const pdfRoutes = require('./routes/pdfprocrequest');
const approvalRoute = require('./routes/approvalReqest');
const sendMailRoute = require('./routes/sendMail');
const pdfRoute = require('./routes/pdfRoutes');
const bidsRouter = require('./routes/SendVendorsMail');
const budgetRouter = require('./routes/budget');
const path = require('path');
const PORT = process.env.PORT || 8000;
const env = require('dotenv');
env.config();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', // <-- your frontend URL
  credentials: true
}));

// --- SESSION AND PASSPORT MIDDLEWARE MUST COME BEFORE ROUTES ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());
// ---------------------------------------------------------------

// --- ROUTES ---
app.use('/user', userRouter);
app.use('/supplyer', supplyerRouter);
app.use('/item', itemRouter);
app.use('/guidance', guidanceRouter);
app.use('/notice', noticeRouter);
app.use('/procReqest', procReqestRouter);
app.use('/pdf', pdfRoutes);
app.use('/procProject', procProjectRouter);
app.use(pdfRoute);
app.use('/approvalReqest', approvalRoute);
app.use('/send', sendMailRoute);
app.use('/bids', bidsRouter);
app.use('/budget', budgetRouter);

// --- ERROR HANDLER (should be after all routes) ---
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`The server is listening on port: ${PORT}`);
});