module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    if(process.env.NODE_ENV === 'development'){
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        });
    }

    if(process.env.NODE_ENV === 'production'){
        let error = {...err};

        error.message = err.message;

        //Handling Wrong JWT token error
        if(err.name === 'JsonWebTokenError'){
            error.message = 'JSON Web token is invalid. Try Again!';
            // error = new ErrorHandler(message, 500);
        }

        //Handling Expired JWT token error
        if(err.name === 'TokenExpiredError'){
            error.message = 'JSON Web token is expired. Try Again!';
            // error = new ErrorHandler(message, 500);
        }
        res.status(err.statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error'
        })
    }
}