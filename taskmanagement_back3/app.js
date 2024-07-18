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
const task = require('./routes/task');

app.use(task);

//manage unhandle route - part 2 (put it after all the routes !!!!! e.g. of routes = app.use(jobs);)
app.all('*', (req, res, next) => {
    next(new ErrorHandler(`U404`, 404));
});

//Middleware to handle errors
app.use(errorMiddleware);


const PORT = process.env.PORT;

app.listen(PORT, ()=> {
    console.log(`Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});