const dbconnection = require('../config/configdb');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const bcrypt = require('bcryptjs');


//==================================================================
//create new user
//==================================================================
module.exports.createUser = catchAsyncErrors (async (req, res, next) => {
    const user = req.body;

    const hashpassword = await bcrypt.hash(user.password, 10);

    if(user.email){
        email = user.email;
    }
    else{
        email = "";
    }

    const insertdata = [user.username, hashpassword, email, 'active'];
    const insertcol = ['username', 'password', 'email', 'status'];

    const joindata = "'" + insertdata.join("' , '") + "'";
    const joincol = insertcol.join();


    const query = 'INSERT INTO tms_users (' + joincol + ') VALUES (?, ?, ?, ?)';

    dbconnection.query(
        query,
        insertdata,
        function(err, rows) {
            if (err){
                if(err.code === "ER_DUP_ENTRY"){
                    return next(new ErrorHandler('Username Exist. Please use another username', 500));
                }
                else{
                    return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                }

                // throw err;
            }
            else{
                res.status(200).json({
                    success: true,
                    message: "User created successful",
                });
            }
            
        }
    )
});


//==================================================================
//get user profile
//==================================================================
module.exports.getOwnProfile = (req, res, next) => {
    dbconnection.query(
        'SELECT * FROM tms_users WHERE id = ? ', 
        [req.user.id],
        function(err, rows) {
            if (err){
                return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                // throw err;
            }
            else{
                res.status(200).json({
                    success: true,
                    data: rows,
                });
            }
            
        }
    )
}

//==================================================================
//get all user
//==================================================================
module.exports.getAllUser = (req, res, next) => {
    dbconnection.query(
        'SELECT * FROM tms_users',
        function(err, rows) {
            if (err){
                // return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                throw err;
            }
            else{
                res.status(200).json({
                    success: true,
                    data: rows,
                });
            }
            
        }
    )
}

//==================================================================
//get specific user
//==================================================================
module.exports.getUserById = (req, res, next) => {
    const query = 'SELECT * FROM tms_users WHERE id = ? ';

    dbconnection.query(
        query,
        [req.params.id],
        function(err, rows) {
            if (err){
                // return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                throw err;
            }
            else{
                res.status(200).json({
                    success: true,
                    data: rows,
                });
            }
            
        }
    )
}