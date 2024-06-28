const dbconnection = require('../config/configdb');
const jwt = require('jsonwebtoken');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

//==================================================================
//check if user is in group
//==================================================================
const Checkgroup = (userid, groupname) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT groupname FROM tms_usergroups WHERE username = ? and groupname = ?';

        dbconnection.query(
            query,
            [userid, groupname],
            function(err, rows) {
                if (err) {
                    // Reject the promise with the error
                    reject(err);
                } else {
                    // Check if rows exist
                    if (rows.length > 0) {
                        resolve(true); // Found groupname for userid
                    } else {
                        resolve(false); // Did not find groupname for userid
                    }
                }
            }
        );
    });
};

module.exports.Checkgroup = Checkgroup;


//==================================================================
//check if user is active or deactivate
//==================================================================
const CheckActive = (userid) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM tms_users WHERE username = ?';

        dbconnection.query(
            query,
            [userid],
            function(err, rows) {
                if (err) {
                    // Reject the promise with the error
                    reject(err);
                } else {
                    // Check if rows exist
                    if (rows.length > 0) {
                        if(rows[0].status == 1){
                            resolve(rows[0]); //user active
                        }
                        else{
                            resolve(false); //user deactive
                        }
                         
                    } else {
                        resolve(false); // user doesn't exist
                    }
                }
            }
        );
    });
};


//==================================================================
//check if user is authenicated or not
//==================================================================
module.exports.isAuthenticatedUser = catchAsyncErrors(async(req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(new ErrorHandler('Login first to access this resource.', 403));
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(req.ip !== decoded.ip){
            return next(new ErrorHandler('Login first to access this resource.', 403));
        }
    
        if(req.headers['user-agent'] !== decoded.browser){
            return next(new ErrorHandler('Login first to access this resource.', 403));
        }
    
    
        try {
            const results = await Promise.all([CheckActive(decoded.username)]);
            
            // results will be an array containing the resolved value of CheckActive
            const activeData = results[0];
    
            if (!activeData) {
                return next(new ErrorHandler(`User is not allowed to access this resource.`, 403));
            } else {
                req.user = activeData;
                next(); // User is authorized to proceed
            }   
        }
        catch(err){
            // Handle error appropriately
            console.error("Error authorizing user:", err);
            return next(new ErrorHandler(`Error authorizing user: ${err.message}`, 500));
        }
    }
    catch(e){
        if (e instanceof jwt.JsonWebTokenError) {
            // Handle JWT errors (like malformed token, invalid token, etc.)
            return next(new ErrorHandler('Invalid token. Please log in again.', 403));
        }
    }
});

//==================================================================
//handling user roles
//==================================================================
module.exports.authorizeGroups = (...groups) => {
    return catchAsyncErrors(async(req, res, next) => {
        try {
            const results = await Promise.all(groups.map(group => Checkgroup(req.user.username, group)));

            // Check all results
            const ingroup = results.some(result => result); // true if user is in any group

            if (ingroup) {
                next(); // User is authorized to proceed
            } else {
                return next(new ErrorHandler(`User is not allowed to access this resource.`, 403));
            }
        }
        catch(err){
            // Handle error appropriately
            console.error("Error authorizing groups:", err);
            return next(new ErrorHandler(`Error authorizing groups: ${err.message}`, 500));
        }
    })
}
