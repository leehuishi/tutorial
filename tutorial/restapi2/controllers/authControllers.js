const sqlcon = require('../models/jobs');
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

const sendToken = require('../utils/jwtToken');

//Register new user
module.exports.registerUser = catchAsyncErrors (async (req, res, next) => {
    const user = req.body;
    const date = new Date();

    const hashpassword = await bcrypt.hash(user.password, 10);

    const insertdata = [user.username, hashpassword, date];
    const insertcol = ['username', 'password', 'createdAt'];

    const joindata = "'" + insertdata.join("' , '") + "'";
    const joincol = insertcol.join();

    const query = 'INSERT INTO user (' + joincol + ') VALUES (' + joindata + ')';

    sqlcon.query(
        query,
        function(err, rows) {
            if (err){
                throw err;
            }
            else{
                //create JWT Token with utils
                sendToken(rows.insertId, 200, res);
            }
            
        }
    )
});


//Login user 
module.exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { username, password } = req.body;

    //check if email or passowrd is entered by user
    if(!username || !password) {
        return next(new ErrorHandler('Please enter email & password'), 400)
    }

    //finding user in database
    const query = 'select user_id, password from user where username = "' + username + '"';

    sqlcon.query(
        query,
        catchAsyncErrors(async function (err, rows) {
            if (err){
                throw err;
            }
            else{
                if(rows.length < 1){
                    //errorHandling
                    return next(new ErrorHandler('Invalid Email or Password', 401));
                }
                else{

                    //check if password is correct
                    //compare user password in database password
                    const raw_user_id = rows[0]['user_id'];
                    const raw_password = rows[0]['password'];
                    
                    const isPasswordMatched = await bcrypt.compare(password, raw_password);

                    if(!isPasswordMatched) {
                        return next(new ErrorHandler('Invalid Email or Password', 401));
                    }

                    //create JWT Token with utils
                    sendToken(raw_user_id, 200, res);
                }
            }
        })
    );
});


//Forgot password (Skipped reset password !!!!! NEED TO CONTINUE)
// module.exports.forgotPassword = catchAsyncErrors(async(req, res, next) => {
//     //finding user in database
//     const query = 'select * from user where email = "' + email + '"';

//     sqlcon.query(
//         query,
//         catchAsyncErrors(async function (err, rows) {
//             if (err){
//                 throw err;
//             }
//             else{
//                 if(rows.length < 1){
//                     //errorHandling
//                     return next(new ErrorHandler('No user found with this email.', 404));
//                 }
//                 else{
//                     //Generate token
//                     const resetToken = crypto.randomBytes(20).toString('hex');

//                     //hash and set to resetPasswordToken
//                     const resetPasswordToken = crypto
//                         .createHash('sha256')
//                         .update(resetToken)
//                         .digest('hex');

//                     //Set token expire time
//                     const resetPasswordExpire = Date.now() + 30*60*100;
//                 }
//             }
//         })
//     );
// });


//possible solution for using result outside of query
// function executeQuery(query) {
//     return new Promise((resolve, reject) => {
//         connection.query(query, (error, results) => {
//             if (error) {
//                 return reject(error);
//             }
//             resolve(results);
//         });
//     });
// }

// executeQuery('SELECT * FROM your_table')
//     .then(results => {
//         // Use the results here
//         console.log(results);
//     })
//     .catch(error => {
//         // Handle error
//         console.error(error);
//     })
//     .finally(() => {
//         // Close the connection
//         connection.end();
//     });


//Logout user
module.exports.logout = catchAsyncErrors(async(req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
    });
});