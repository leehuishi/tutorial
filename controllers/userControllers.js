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

    const insertdata = [user.username, hashpassword, user.email, user.role, 'active'];
    const insertcol = ['username', 'password', 'email', 'role', 'status'];

    const joindata = "'" + insertdata.join("' , '") + "'";
    const joincol = insertcol.join();


    const query = 'INSERT INTO accounts (' + joincol + ') VALUES (?, ?, ?, ?, ?)';

    dbconnection.query(
        query,
        insertdata,
        function(err, rows) {
            if (err){
                return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                // throw err;
            }
            else{
                //create JWT Token with utils
                sendToken(rows.insertId, 200, res);
            }
            
        }
    )
});


//==================================================================
//get user profile
//==================================================================
module.exports.getUserProfile = (req, res, next) => {
    dbconnection.query(
        'select * from accounts where id = "' + req.user.id + '" ',
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
module.exports.getallUser = (req, res, next) => {
    dbconnection.query(
        'select * from accounts where id = "' + req.user.id + '" ',
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