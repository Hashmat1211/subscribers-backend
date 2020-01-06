// Importing the dependencies
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const subscribersRouter = require('./api/routes/subscribers.route');
const fileRouter = require('./api/routes/files.route');


// running express library and creating an instance
const app = express();

// connnecting to MongoDB
mongoose.connect(`mongodb+srv://hashmat2526:superior.com@mflix-kkh9f.mongodb.net/subscribers?retryWrites=true&w=majority`, { useNewUrlParser: true, useCreateIndex: true })

// adding middleware to log incoming requests to console
app.use(morgan('dev'));

// adding middleware to parse body of the incoming requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept, Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
        return res.status(200).json({});
    }
    next();
});



// adding middleware to route incoming requests
app.use('/upload', express.static('upload'));
app.use('/csvFiles', express.static('csvFile'));
app.use('/jsonFiles', express.static('jsonFiles'));
app.use('/subscribers', subscribersRouter);
app.use('/files', fileRouter);


// adding middleware to handle invalid route request
app.use((req, res, next) => {
    const err = new Error('Yakh Pakh');
    err.status = 404;
    next(err);
});

// adding middleware to handle errors
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message
    });
});

// exporting the app object
module.exports = app;