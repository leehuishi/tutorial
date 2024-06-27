const dbconnection = require('../config/configdb');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const bcrypt = require('bcryptjs');

//==================================================================
//Login user 
//==================================================================
// Function to check login
function checkLogin(username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT password, status FROM tms_users WHERE username = ?';
        
        dbconnection.query(query, [username], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                // Check if rows exist
                if (rows.length > 0) {
                    resolve(rows[0]); // Resolve with the first row (assuming username is unique)
                } else {
                    resolve(false); // Resolve with false if user doesn't exist
                }
            }
        });
    });
}

module.exports.loginUser = catchAsyncErrors(async (req, res, next ) => {
    const { username, password } = req.body;

    //check if email or passowrd is entered by user
    if(!username || !password) {
        return next(new ErrorHandler('Please enter username & password'), 400)
    }

    try {
        const loginres = await checkLogin(username);
        
        if (!loginres) {
            return next(new ErrorHandler('Invalid Username or Password', 401));
        }

        // Check if user is active
        const raw_status = loginres['status'];
        if (raw_status === 0) {
            return next(new ErrorHandler('User is deactivated. Please contact admin for more information', 403));
        }

        // Check if password is correct
        const raw_password = loginres['password'];
        const isPasswordMatched = await bcrypt.compare(password, raw_password);

        if (!isPasswordMatched) {
            return next(new ErrorHandler('Invalid Username or Password', 401));
        }

        // If all checks pass, send token
        sendToken(username, 200, res, req);

    } catch (error) {
        console.error('Error in loginUser:', error);
        return next(new ErrorHandler('Internal Server Error', 500)); // Handle other errors
    }
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