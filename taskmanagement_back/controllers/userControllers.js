const dbconnection = require('../config/configdb');

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const bcrypt = require('bcryptjs');
const { Checkgroup } = require('../middlewares/auth');

function checkusername(username){
    //alphanumeric and underscore
    //length of 4 to 32
    const regex = /^[a-zA-Z0-9_]{4,32}$/;

    if(!regex.test(username)){
        return false;
    }
    else{
        return true;
    }
}

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
// Query to insert new user
function insertNewUser(insertdata) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO tms_users (username, password, email, status) VALUES (?, ?, ?, ?)';
        
        dbconnection.query(query, insertdata, function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                //insert data successfully
                resolve(true); 
            }
        });
    });
}

//---------------------------------------------
//---------------------------------------------

module.exports.createUser = catchAsyncErrors (async (req, res, next) => {
    const user = req.body;

    //--------------------------------------------------------------
    //handle username
    //--------------------------------------------------------------
    //check username format
    const checkuser = checkusername(user.username);

    if(!checkuser){
        return next(new ErrorHandler('Invalid username format', 400));
    }
    //--------------------------------------------------------------

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
   
    try {
        const newUserRes = await insertNewUser(insertdata);
        
        if(newUserRes){
            res.status(200).json({
                success: true,
                message: "User created successful",
            });
        }

    } catch (err) {
        if(err.code === "ER_DUP_ENTRY"){
            return next(new ErrorHandler('Username Exist. Please use another username', 500));
        }
        else{
            return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
        }
    }
});


//==================================================================
//get user profile
//==================================================================
// Query to get user information
function userInfo(username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT username, email, status FROM tms_users WHERE username = ? ';
        
        dbconnection.query(query, [username], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                if(rows.length > 0){
                    resolve(rows); //user exist
                }
                else{
                    resolve(false); //user doesn't exist
                }
            }
        });
    });
}

//---------------------------------------------
//---------------------------------------------

module.exports.getOwnProfile = catchAsyncErrors(async (req, res, next) => {
    try {
        const userRes = await userInfo(req.user.username);
        
        if(userRes){
            res.status(200).json({
                success: true,
                data: userRes,
            });
        }
        else{
            return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
        }

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});

//==================================================================
//get all user
//==================================================================
// Query to get all users info
function allUserInfo() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT username, email, status FROM tms_users';
        
        dbconnection.query(query, function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                if(rows.length > 0){
                    resolve(rows); //there are users
                }
                else{
                    resolve(false); //there are no users
                }
            }
        });
    });
}

//---------------------------------------------
//---------------------------------------------

// Query to get all users info
function eachUserGrp(username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT groupname FROM tms_usergroups WHERE username = ?';
        
        dbconnection.query(query, [username], function(err, groupRows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                if(groupRows.length > 0){
                    resolve(groupRows); //user is in group(s)
                }
                else{
                    resolve(false); //user not in any groups
                }
            }
        });
    });
}

module.exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    try {
        const allUserRes = await allUserInfo();
        
        // Array to hold all users with their groups
        const users = [];

        if(allUserRes){
            const userPromises = allUserRes.map(catchAsyncErrors(async (userRow) => {
                const user = {
                    username: userRow.username,
                    email: userRow.email,
                    status: userRow.status,
                    groups: [] // Initialize groups array
                };
    
                const groupRows = await eachUserGrp(userRow.username);
    
                if (groupRows) {
                    // Populate groups array for the user
                    groupRows.forEach(groupRow => {
                        user.groups.push(groupRow.groupname);
                    });
                }
    
                // Push user object with groups to users array
                users.push(user);
            }));

            // Wait for all promises to resolve using Promise.all
            await Promise.all(userPromises);

            res.status(200).json({
                success: true,
                data: users
            });
        }
        else{
            // Send response with empty users array
            res.status(200).json({
                success: true,
                data: users
            });
        }

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});

//==================================================================
//Update own password
//==================================================================
// Query to update password
function updatePwd(password, username) {
    return new Promise((resolve, reject) => {
        const query = 'Update tms_users SET password = ? where username = ?';
        
        dbconnection.query(query, [password, username], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                resolve(true); //Update password successful
            }
        });
    });
}

//---------------------------------------------
//---------------------------------------------

module.exports.updateOwnPassword = catchAsyncErrors(async (req, res, next) => {
    const user_input = req.body;

    const new_password = user_input.password;

    //check password format
    const checkpass = checkpassword(new_password);

    if(!checkpass){
        return next(new ErrorHandler('Invalid password format', 400));
    }

    // hash new password
    const hashpassword = await bcrypt.hash(new_password, 10);

    //--------------------------------------------------------
    try {
        const updatePwdRes = await updatePwd(hashpassword, req.user.username);
        
        if(updatePwdRes){
            res.status(200).json({
                success: true,
                message: "Update successful.",
            });
        }
        else{
            return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
        }

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});


//==================================================================
//Update own email
//==================================================================
// Query to update email
function updateEmail(email, username) {
    return new Promise((resolve, reject) => {
        const query = 'Update tms_users SET email = ? where username = ?';
        
        dbconnection.query(query, [email, username], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                resolve(true); //Update password successful
            }
        });
    });
}

//---------------------------------------------
//---------------------------------------------

module.exports.updateOwnEmail = catchAsyncErrors(async (req, res, next) => {
    const user_input = req.body;

    const new_email = user_input.email;

    //check email format
    if(new_email !== ''){
        const check_e = checkemail(new_email);

        if(!check_e){
            return next(new ErrorHandler('Invalid email format', 400));
        }
    }

    //--------------------------------------------------------
    try {
        const updateEmailRes = await updateEmail(new_email, req.user.username);
        
        if(updateEmailRes){
            res.status(200).json({
                success: true,
                message: "Update successful.",
            });
        }
        else{
            return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
        }

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});


//==================================================================
//Update by profile
//==================================================================
// Query to update profile
function updateProfile(query, updatedata) {
    return new Promise((resolve, reject) => {
        dbconnection.query(query, updatedata, function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                resolve(true); //Update password successful
            }
        });
    });
}

//---------------------------------------------
//---------------------------------------------

module.exports.updateUserByUsername = catchAsyncErrors(async (req, res, next) => {
    if(!req.params.username){
        return next(new ErrorHandler('Missing required parameter.', 400));
    }

    const user = req.body;
    const updatedata = [];

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
        updatedata.push(hashpassword);
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

    updatedata.push(email);
    //--------------------------------------------------------------


    //--------------------------------------------------------------
    //handle status
    //--------------------------------------------------------------
    if(user.status !== 1 && user.status !== 0){
        return next(new ErrorHandler('Invalid status', 400));
    }
    else{
        updatedata.push(user.status);
    }
    
    //--------------------------------------------------------------

    updatedata.push(req.params.username);

    query += 'email = ?, status = ? WHERE username = ?';

    //--------------------------------------------------------
    try {
        const updateProfileRes = await updateProfile(query, updatedata);
        
        if(updateProfileRes){
            res.status(200).json({
                success: true,
                message: "User update successful",
            });
        }
        else{
            return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
        }

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});

//==================================================================
//check if user is admin
//==================================================================
module.exports.getCheckIsAdmin = (req, res, next) => {

    Checkgroup(req.user.username, 'admin')
    .then(result => {
        if(result){
            res.status(200).json({
                success: true,
                data: {
                    isAdmin: true
                }
            });
        }
        else{
            res.status(200).json({
                success: true,
                data: {
                    isAdmin: false
                }
            });
        }
    })
    .catch(err => {
        console.error('Error checking group:', err);
    });
}


//==================================================================
//check if user exist
//==================================================================
// Query to check if username exist
function checkUsername(username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT username FROM tms_users WHERE username = ?';
        
        dbconnection.query(query, [username], function(err, rows) {
            if (err) {
                reject(err); // Reject with the database query error
            } else {
                if(rows.length > 0){
                    resolve(true); //username exist
                }
                else{
                    resolve(false); //username doesn't exist
                }
            }
        });
    });
}

//---------------------------------------------
//---------------------------------------------

module.exports.checkUser = catchAsyncErrors(async(req, res, next) => {
    try {
        const usernameRes = await checkUsername(req.params.username);
        
        if(usernameRes){
            res.status(200).json({
                success: true,
                data: {
                    usernameexist: true
                }
            });
        }
        else{
            res.status(200).json({
                success: true,
                data: {
                    usernameexist: false
                }
            });
        }

    } catch (err) {
        return next(new ErrorHandler('The database server is unavailable, or there is a syntax error in the database query.', 500));
    }
});