const express = require('express');
const app = express();

const dotenv = require('dotenv');
const cors = require('cors');

const errorMiddleware = require('./middlewares/errors');
const ErrorHandler = require('./utils/errorHandler'); //manage unhandle route - part 1


//==============================================================
//Setup
//==============================================================
//setting up config.env file variables
dotenv.config({path: './config/config.env'});

//set up body parser
app.use(express.json());

//Set up CORS - Accessible by other domains
app.use(cors());

//==============================================================


//==============================================================
//Importing all routes
//==============================================================
const auth = require('./routes/auth');
const user = require('./routes/user');
const group = require('./routes/group');

app.use(auth);
app.use(user);
app.use(group);

//manage unhandle route - part 2 (put it after all the routes !!!!! e.g. of routes = app.use(jobs);)
app.all('*', (req, res, next) => {
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

//Middleware to handle errors
app.use(errorMiddleware);


const PORT = process.env.PORT;

app.listen(PORT, ()=> {
    console.log(`Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});