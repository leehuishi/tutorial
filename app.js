const express = require('express');
const app = express();

const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit'); //limit the number of request a user can make within a certain amount of time
const helmet = require('helmet');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const errorMiddleware = require('./middlewares/errors');
const ErrorHandler = require('./utils/errorHandler'); //manage unhandle route part 1

//setting up config.env file variables
dotenv.config({path: './config/config.env'});


//Handle Uncaught Exception (option, need to be on the top to handle the error if not it will not sense it)
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`);
    console.log(`Shutting down due to uncaught exception.`);
    process.exit(1);
});

//set up security headers (put at the very top)
app.use(helmet());

//set up body parser
app.use(express.json());

//set cookie parser
app.use(cookieParser());

//Prevent XSS attacks
app.use(xssClean());

//Prevent Parameter Pollution
//prevent 2 of the same parameter 
//e.g.http://localhost:3000/jobs?sort=JobType&sort=Salary //it will take only one or even both and cause confusion
//it will take both as parameter//then use whitelist to filter 
app.use(hpp({
    whitelist:['positions']
}));

//Rate limiting
const limiter = rateLimit({
    windowMs: 10*60*1000, //10 mins
    max: 100
});

app.use(limiter);

//Set up CORS - Accessible by other domains
app.use(cors());


//Creating own middleware (applied to all api)
// const middleware = (req, res, next) => {
//     console.log('Hello from middleware.');
//     req.user = 'John';

//     next();
// }

// app.use(middleware);

//Importing all routes
const jobs = require('./routes/jobs');
const auth = require('./routes/auth');
const user = require('./routes/user');

app.use(jobs);
app.use(auth);
app.use(user);
// app.use('/api/v1', jobs); //when u want to define more in front of the routes 

//manage unhandle route 2 (put it after all the routes !!!!! e.g. of routes = app.use(jobs);)
app.all('*', (req, res, next) => {
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

//Middleware to handle errors
app.use(errorMiddleware);

const PORT = process.env.PORT;

app.listen(PORT, ()=> {
    console.log(`Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});