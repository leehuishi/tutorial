const dbconnection = require('../config/configdb');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const bcrypt = require('bcryptjs');

//==================================================================
//Login user 
//==================================================================
module.exports.loginUser = catchAsyncErrors(async (req, res, next ) => {
    const { email, password } = req.body;

    //check if email or passowrd is entered by user
    if(!email || !password) {
        return next(new ErrorHandler('Please enter email & password'), 400)
    }

    //finding user in database
    const query = 'select password, id from accounts where email = "' + email + '"';

    dbconnection.query(
        query,
        catchAsyncErrors(async function (err, rows) {
            if (err){
                return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                // throw err;
            }
            else{
                if(rows.length < 1){
                    //errorHandling
                    return next(new ErrorHandler('Invalid Email or Password', 401));
                }
                else{

                    //check if password is correct
                    //compare user password in database password
                    const raw_password = rows[0]['password'];
                    const raw_user_id = rows[0]['id'];
                    
                    const isPasswordMatched = await bcrypt.compare(password, raw_password);

                    if(!isPasswordMatched) {
                        return next(new ErrorHandler('Invalid Email or Password', 401));
                    }

                    sendToken(raw_user_id, 200, res);

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