const dbconnection = require('../config/configdb');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const bcrypt = require('bcryptjs');

//==================================================================
//Login user 
//==================================================================
module.exports.loginUser = catchAsyncErrors(async (req, res, next ) => {
    const { username, password } = req.body;

    //check if email or passowrd is entered by user
    if(!username || !password) {
        return next(new ErrorHandler('Please enter username & password'), 400)
    }

    //finding user in database
    const query = 'select password, status from tms_users where username = ?';

    dbconnection.query(
        query,
        [username],
        catchAsyncErrors(async function (err, rows) {
            if (err){
                return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                // throw err;
            }
            else{
                if(rows.length < 1){
                    //errorHandling
                    return next(new ErrorHandler('Invalid Username or Password', 401));
                }
                else{
                    //check if it is active user
                    const raw_status = rows[0]['status'];
                    if(raw_status === 0){
                        return next(new ErrorHandler('User is deactivated. Please contact admin for more information', 403));
                    }

                    //check if password is correct
                    //compare user password in database password
                    const raw_password = rows[0]['password'];
                    
                    const isPasswordMatched = await bcrypt.compare(password, raw_password);

                    if(!isPasswordMatched) {
                        return next(new ErrorHandler('Invalid Username or Password', 401));
                    }

                    sendToken(username, 200, res, req);

                }
            }
        })
    );
});


//==================================================================
//Logout user
//==================================================================
module.exports.logoutUser = catchAsyncErrors(async(req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
    });
});