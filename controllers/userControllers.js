const dbconnection = require('../config/configdb');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const bcrypt = require('bcryptjs');

function checkpassword(password){
    //validate password
    //no whitespace
    //at least 1 alphabet
    //at least 1 special character
        //specified set (_, ., ,, $, @, !, %, *, ?, &).
    //at least 1 number
    //length of 8 to 10
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])[A-Za-z\d\S]{8,10}$/;

    if(!regex.test(password)){
        return false;
    }
    else{
        return true;
    }
}

function checkemail(email){
    //validate email
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!regex.test(email)){
        return false;
    }
    else{
        return true;
    }
}


//==================================================================
//create new user
//==================================================================
module.exports.createUser = catchAsyncErrors (async (req, res, next) => {
    const user = req.body;

    //--------------------------------------------------------------
    //handle password
    //--------------------------------------------------------------
    //check password format
    const checkpass = checkpassword(user.password);

    if(!checkpass){
        return next(new ErrorHandler('Invalid password format', 400));
    }

    const hashpassword = await bcrypt.hash(user.password, 10);
    //--------------------------------------------------------------


    //--------------------------------------------------------------
    //handle email
    //--------------------------------------------------------------
    if(user.email){
        email = user.email;

        const check_e = checkemail(email);

        if(!check_e){
            return next(new ErrorHandler('Invalid email format', 400));
        }
    }
    else{
        email = "";
    }
    //--------------------------------------------------------------

    const insertdata = [user.username, hashpassword, email, 1];
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

                throw err;
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
        'SELECT * FROM tms_users WHERE username = ? ', 
        [req.user.username],
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
//get all user
//==================================================================
module.exports.getAllUser = (req, res, next) => {
    dbconnection.getConnection((err, connection) => {
        if (err) {
            // return next(new ErrorHandler('The database server is unavailable, or there is database connection error.', 500));
            throw err;
        }

        // Query to fetch all users
        connection.query('SELECT username, email, status FROM tms_users', (err, rows) => {
            if (err) {
                // return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                throw err;
            }

            // Array to hold all users with their groups
            const users = [];

            // Counter to keep track of queries completed
            let queriesCompleted = 0;

            // Iterate through each user
            rows.forEach((userRow, index) => {
                const user = {
                    username: userRow.username,
                    email: userRow.email,
                    status: userRow.status,
                    groups: [] // Initialize groups array
                };

                // Query to fetch groups for the current user
                connection.query('SELECT groupname FROM tms_usergroups WHERE username = ?', user.username, (err, groupRows) => {
                    if (err) {
                        // return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                        throw err;
                    }

                    // Populate groups array for the user
                    groupRows.forEach(groupRow => {
                        user.groups.push(groupRow.groupname);
                    });

                    // Push user object with groups to users array
                    users.push(user);

                    // Increment counter for completed queries
                    queriesCompleted++;

                    // Check if all queries are completed
                    if (queriesCompleted === rows.length) {
                        // Release connection back to the pool
                        connection.release();

                        // Send response with users and their groups
                        res.status(200).json({
                            success: true,
                            data: users
                        });
                    }
                });
            });

            // If no users are found
            if (rows.length === 0) {
                // Release connection back to the pool
                connection.release();

                // Send response with empty users array
                res.status(200).json({
                    success: true,
                    data: users
                });
            }
        });
    });
}

//==================================================================
//Update own password
//==================================================================
module.exports.updateOwnPassword = catchAsyncErrors (async (req, res, next) => {
    const user_input = req.body;

    const new_password = user_input.password;

    //check password format
    const checkpass = checkpassword(new_password);

    if(!checkpass){
        return next(new ErrorHandler('Invalid password format', 400));
    }

    // hash new password
    const hashpassword = await bcrypt.hash(new_password, 10);


    const query = 'Update tms_users SET password = ? where username = ?';

    dbconnection.query(
        query,
        [hashpassword, req.user.username],
        function(err, rows) {
            if (err){
                return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));

                throw err;
            }
            else{
                res.status(200).json({
                    success: true,
                    message: "Update successful.",
                });
            }
            
        }
    )
});


//==================================================================
//Update own email
//==================================================================
module.exports.updateOwnEmail = catchAsyncErrors (async (req, res, next) => {
    const user_input = req.body;

    const new_email = user_input.email;

    //check email format
    if(new_email !== ''){
        const check_e = checkemail(new_email);

        if(!check_e){
            return next(new ErrorHandler('Invalid email format', 400));
        }
    }

    const query = 'Update tms_users SET email = ? where username = ?';

    dbconnection.query(
        query,
        [new_email, req.user.username],
        function(err, rows) {
            if (err){
                return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));

                throw err;
            }
            else{
                res.status(200).json({
                    success: true,
                    message: "Update successful.",
                });
            }
            
        }
    )
});


//==================================================================
//Update by profile
//==================================================================
module.exports.updateUserByUsername = catchAsyncErrors (async (req, res, next) => {
    if(!req.params.username){
        return next(new ErrorHandler('Missing required parameter.', 400));
    }

    const user = req.body;
    const insertdata = [];
    

    //--------------------------------------------------------------
    //handle password
    //--------------------------------------------------------------
    var query = "UPDATE tms_users SET ";

    //check password format
    if(user.password && user.password !== ""){
        const checkpass = checkpassword(user.password);

        if(!checkpass){
            return next(new ErrorHandler('Invalid password format', 400));
        }

        const hashpassword = await bcrypt.hash(user.password, 10);
        query += "password = ?, "
        insertdata.push(hashpassword);
    }
    //--------------------------------------------------------------


    //--------------------------------------------------------------
    //handle email
    //--------------------------------------------------------------
    if(user.email){
        email = user.email;

        const check_e = checkemail(email);

        if(!check_e){
            return next(new ErrorHandler('Invalid email format', 400));
        }
    }
    else{
        email = "";
    }

    insertdata.push(email);
    //--------------------------------------------------------------


    //--------------------------------------------------------------
    //handle status
    //--------------------------------------------------------------
    if(user.status !== 1 && user.status !== 0){
        return next(new ErrorHandler('Invalid status', 400));
    }
    else{
        insertdata.push(user.status);
    }
    
    //--------------------------------------------------------------

    insertdata.push(req.params.username);

    query += 'email = ?, status = ? WHERE username = ?';

    dbconnection.query(
        query,
        insertdata,
        function(err, rows) {
            if (err){
                // return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
                throw err;
            }
            else{
                res.status(200).json({
                    success: true,
                    message: "User update successful",
                });
            }
            
        }
    )
});