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


    // if(process.env.NODE_ENV === 'development'){
    //     res.status(err.statusCode).json(err.message.slice(-3));
        
    // }


    // if(process.env.NODE_ENV === 'development'){
    //     res.status(err.statusCode).json(err.message);
        
    // }

    // if(process.env.NODE_ENV === 'development'){
    //     res.status(err.statusCode).send();
    // }
}