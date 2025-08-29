const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

// Load environment variables
require('dotenv').config();

// Database connection
require('./database/database');

// Error handling middleware
require('express-async-errors');
const { errorHandler } = require('./middlewares/error');

// Import routes
const userRouter = require("./routes/user");
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
const procDashRouter = require('./routes/proc_dash');

const PORT = process.env.PORT || 8000;
const path = require('path');
// Middleware
app.use(express.json());                   // Parses incoming JSON requests
app.use(bodyParser.json());                // Parses incoming request bodies in a JSON format
app.use(cors());

// Routes
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
app.use('/api/proc-dashboard', procDashRouter);

// Error handling middleware (should be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`The server is listening on port: ${PORT}`);
});